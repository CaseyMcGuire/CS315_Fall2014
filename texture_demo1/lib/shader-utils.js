/**
 * This file contains helper functions for loading and setting up GLSL shaders
 */

var ShaderUtils = {

  /**
   * loads, compiles, and links the given shaders into a program
   * @param  {[type]} gl             WebGL context
   * @param  {[type]} vertexShader   filename for the vertex shader
   * @param  {[type]} fragmentShader filename for the fragment shader
   * @param  {[type]} attributes     an array of attributes to bind (if any)
   * @return {[type]}                a handle pointing at the shader program
   */
  initShaders : function(gl, vertexShader, fragmentShader, attributes){

    vertexCode = this.loadShaderCode(vertexShader);
    fragmentCode = this.loadShaderCode(fragmentShader);

    var vertexShaderHandle = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderHandle, vertexCode);
    gl.compileShader(vertexShaderHandle);
    if(!gl.getShaderParameter(vertexShaderHandle,gl.COMPILE_STATUS))
    {
      console.log('Vertex shader failed to compile: '+gl.getShaderInfoLog(vertexShaderHandle));
      return -1;
    }

    var fragmentShaderHandle = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderHandle, fragmentCode);
    gl.compileShader(fragmentShaderHandle);
    if(!gl.getShaderParameter(fragmentShaderHandle,gl.COMPILE_STATUS))
    {
      console.log('Fragment shader failed to compile: '+gl.getShaderInfoLog(fragmentShaderHandle));
      return -1;
    }

    var shaderProgramHandle = gl.createProgram();
    gl.attachShader(shaderProgramHandle,vertexShaderHandle);
    gl.attachShader(shaderProgramHandle,fragmentShaderHandle);

    //explicitly bind attributes
    if (attributes) {
      for (i = 0; i < attributes.length; i++) {
        gl.bindAttribLocation(shaderProgramHandle, i, attributes[i]);
      }
    }
    gl.linkProgram(shaderProgramHandle);
    if(!gl.getProgramParameter(shaderProgramHandle, gl.LINK_STATUS))
    {
      console.log('Shader program failed to link: '+gl.getProgramInfoLog(shaderProgramHandle));
      return -1;
    }

    return shaderProgramHandle;
  },

  loadShaderCode : function(filename){
      var text;
      $.ajax({
          async: false,
          url: filename,
          dataType: 'text',
          success : function( data ) {
              text = data;
          }
      });
      return text;
  }

};