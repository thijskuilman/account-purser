var passwords = "";

function dropHandler(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.items) {
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      if (ev.dataTransfer.items[i].kind === 'file') {
        processExport(ev.dataTransfer.files[0]);
      }
    }
  } else {
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      processExport(ev.dataTransfer.files[0]);
    }
  }
  removeDragData(ev)
}

function processExport(file) {
  document.getElementById("dropzone_icon").remove();
  document.getElementById("dropzone_text").innerText = "Imported: " + file.name;
  var fileObject = file,read = new FileReader();
  read.readAsBinaryString(fileObject);
  read.onloadend = function(){
      passwords = read.result;
      refreshList();
  }
}

function dragOverHandler(ev) {
  ev.preventDefault();
  document.getElementById("drop_zone").style.opacity = "0.5";
}

function dragLeaveHandler(ev) {
  ev.preventDefault();
  document.getElementById("drop_zone").style.opacity = "1";
}

function removeDragData(ev) {
  if (ev.dataTransfer.items) {
    ev.dataTransfer.items.clear();
  } else {
    ev.dataTransfer.clearData();
  }
}
