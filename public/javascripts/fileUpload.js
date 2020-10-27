const { FilePond } = require("filepond");

FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )


FilePond.parse(document.body);


/*
const inputElement = document.querySelector("input[type = file]");
const pond = FilePond.create(inputElement, {

    onpreparefile: (fileItem, output) => {
        console.log(output)
    }
});
*/