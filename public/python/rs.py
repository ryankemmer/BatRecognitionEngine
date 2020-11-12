import time
from cv2 import cv2
import argparse
import math
import numpy as np
from imutils.video import FileVideoStream, FPS

class main:

    def __init__(self,args):
        initialisationPeriod = args.frames# decrease when noisy, increase when clear
        self.loadVideoStream(args)
        self.dim = None
        self.kernel = np.ones((3,3), np.uint8)
        self.run(initialisationPeriod, args)

    def stop(self):
        self.stream.stop()
        cv2.destroyAllWindows()

    def loadVideoStream(self, args):
        self.stream = FileVideoStream(args.video).start()

    def loadVideoFrame(self):
        frame = self.stream.read()

        self.h, self.w, _ = frame.shape
        if self.dim is None:
            scale_percent = 130 # percent of original size
            width = int(frame.shape[1] * scale_percent / 100)
            height = int(frame.shape[0] * scale_percent / 100)
            self.dim = (width, height)
        frame = cv2.resize(frame, self.dim, interpolation=cv2.INTER_AREA)
        if frame is None:
            self.stop()
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frame = frame/255
        frame.astype('float16')
        iCOR = self.correctImage(frame)
        return frame, iCOR

    def correctImage(self, frame):
        try:
            SAT = self.invNPix * frame
            iCOR = frame - SAT
        except:
            self.nR, self.nC, *_ = frame.shape
            self.invNPix = 1/(self.nR*self.nC)
            SAT = self.invNPix * frame
            iCOR = frame - SAT
        return iCOR

    def initialiseFilters(self, initialisationPeriod):
        for self.n in range(initialisationPeriod):
            frame, iCOR = self.loadVideoFrame()
            self.initialiseBackgroundFilter(iCOR)
            self.initialiseVarianceFilter(frame, iCOR)
        self.iBG = self.rollingAvg_iCOR
        self.iVARsq = self.rollingAvg_iVARsq

    def initialiseBackgroundFilter(self, iCOR):
        try:
            self.rollingAvg_iCOR = self.rollingAvg_iCOR + (iCOR - self.rollingAvg_iCOR)/self.n
        except:
            self.rollingAvg_iCOR = iCOR
            self.rollingAvg_iCOR.astype('float16')

    def initialiseVarianceFilter(self, frame, iCOR):
        try:
            self.rollingAvg_iVARsq = self.rollingAvg_iVARsq + (np.square(self.rollingAvg_iCOR -frame) - self.rollingAvg_iVARsq)/self.n
        except:
            self.rollingAvg_iVARsq = np.square(self.rollingAvg_iCOR-frame)
            self.rollingAvg_iVARsq.astype('float16')

    def updateThresholds(self, t1, t2, iVAR):
        T1 = t1*iVAR
        T2 = t2*iVAR
        return T1, T2

    def generateMasks(self, iCOR, iBG, THRESHOLD_ONE):
        iRES = iCOR - iBG
        absiRES = np.abs(iRES)
        temp = THRESHOLD_ONE - absiRES
        temp = np.clip(temp, a_min=0, a_max=255)
        update_BG_mask = cv2.threshold(temp, 0, 1, cv2.THRESH_BINARY_INV)[1]
        freeze_update_BG_mask = cv2.threshold(temp, 0, 1, cv2.THRESH_BINARY)[1]
        return update_BG_mask, freeze_update_BG_mask

    def predict_iBG(self, alpha, iCOR, iBG, update_BG_mask, freeze_BG_mask):
        update_BG_mask = update_BG_mask*(alpha*iBG + (1-alpha)*iCOR)
        freeze_BG_mask = freeze_BG_mask*iBG
        self.iBG = update_BG_mask + freeze_BG_mask
        self.iBG.astype('float16')
        cv2.imshow("self.iBG", self.iBG)

    def predict_iVAR(self, beta, iVARsq, iBG, iCOR, update_BG_mask, freeze_BG_mask):
        update_BG_mask = update_BG_mask*(beta*iVARsq + (1-beta)*np.square(iCOR - iBG))
        freeze_BG_mask = freeze_BG_mask*iVARsq
        self.iVARsq = update_BG_mask + freeze_BG_mask
        self.iVARsq.astype('float16')
        cv2.imshow("iVARsq", self.iVARsq)

    def generateOutputMask(self, THRESHOLD_TWO, iBG, iCOR):
        absiRES = abs(iBG - iCOR)
        temp = absiRES - THRESHOLD_TWO

        MOVING_mask = np.clip(absiRES, a_min=THRESHOLD_TWO, a_max=1)
        MOVING_mask = (MOVING_mask - THRESHOLD_TWO)*255
        return MOVING_mask

    def display_mask(self, output, overlay=False):

        cv2.imshow("MASK", output)
        k = cv2.waitKey(1)
        if k == ord('q'):
            self.stop()

    def run(self, initialisationPeriod, args):
        t1 = float(args.thr1)
        t2 = float(args.thr2)

        assert t1 < t2

        alpha = 0.99
        beta = 0.99
        self.initialiseFilters(initialisationPeriod)

        video=cv2.VideoWriter('analyzed.avi',cv2.VideoWriter_fourcc(*'FMP4'),15,(255,255))

        while self.stream.more() is True:

            self.iVAR = np.sqrt(self.iVARsq)
            THRESHOLD_ONE, THRESHOLD_TWO = self.updateThresholds(t1, t2, self.iVAR)

            frame, iCOR = self.loadVideoFrame()
            cv2.imshow("INPUT", frame)

            update, freeze = self.generateMasks(iCOR, self.iBG, THRESHOLD_ONE)
            self.predict_iBG(alpha, iCOR, self.iBG, update, freeze)
            self.predict_iVAR(beta, self.iVARsq, self.iBG, iCOR, update, freeze)

            output = self.generateOutputMask(THRESHOLD_TWO, self.iBG, iCOR)
            removed_singles = cv2.erode(output, self.kernel, iterations=1)
            filled_mask = cv2.dilate(removed_singles, self.kernel, iterations=2)
            output = cv2.blur(filled_mask, (9,9))
            self.display_mask(output)

            video.write(output)

        video.release()

        

if __name__ == '__main__':
    argparser = argparse.ArgumentParser()
    argparser.add_argument('-v', '--video', help='path to IR Video')
    argparser.add_argument('-t1', '--thr1', help='Estimation Threshold')
    argparser.add_argument('-t2', '--thr2', help='Output Sensitivty')
    argparser.add_argument('-f', '--frames', help='Number of frames used to train the background')

    args = argparser.parse_args()
    main(args)