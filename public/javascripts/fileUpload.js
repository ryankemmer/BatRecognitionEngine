FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileValidateType
  )


FilePond.parse(document.body);

FilePond.setOptions({
  server: '/upload',
  name: "video",
  maxFiles: 1,
  acceptedFileTypes: ['video/mp4']
});
