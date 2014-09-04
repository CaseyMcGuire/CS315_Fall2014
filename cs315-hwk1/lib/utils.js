var Utils = {

  //returns the plaintext contents of a file
  loadFileText : function(filename){
      var text;
      $.ajax({
          async: false,
          url: filename,
          dataType: 'text',
          success : function( data ) { text = data; }
      });
      return text;
  }
};