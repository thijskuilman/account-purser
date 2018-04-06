var passwords = "";

function dropHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var fileObject = ev.dataTransfer.files[0],read = new FileReader();
        read.readAsBinaryString(fileObject);
        read.onloadend = function(){
          passwords = read.result;
          resetList();
        }

      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {

      var fileObject = ev.dataTransfer.files[0],read = new FileReader();
      read.readAsBinaryString(fileObject);
      read.onloadend = function(){
          passwords = read.result;
          resetList();
      }
      
    }
  } 
  
  removeDragData(ev)
}

function dragOverHandler(ev) {
  ev.preventDefault();

  this.style.opacity = "0.5";
}

function removeDragData(ev) {
  if (ev.dataTransfer.items) {
    ev.dataTransfer.items.clear();
  } else {
    ev.dataTransfer.clearData();
  }
}
