FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    //FilePondPluginFileEncode,
  )


FilePond.parse(document.body);

FilePond.setOptions({
  server: '/upload',
  name: "video"
});
