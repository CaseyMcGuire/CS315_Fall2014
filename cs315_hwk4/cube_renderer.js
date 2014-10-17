function CubeRenderer(gl) {
    //basic params
    gl.clearColor(0.0,  0.0,  0.0,  1.0); //background color
    gl.enable(gl.DEPTH_TEST); //enable depth culling
    gl.depthFunc(gl.LEQUAL);

    //viewing
    gl.viewport(0, 0, canvas.width, canvas.height); //viewport setup
    this.viewMatrix = mat4.lookAt(mat4.create(),
      [0,0,10], //eye's location
      [0,0,0], //point we're looking at
      [0,1,0]  //up vector
      );
    var ratio = canvas.width/canvas.height;
    // var scale = 10; //factor to scale up viewing area
    // this.projectionMatrix = mat4.ortho(mat4.create(),
    //   scale*-ratio, scale*ratio, scale*-1, scale*1, //left, right, buttom, top
    //   0.1, 30.0 //near, far
    // );
    this.projectionMatrix = mat4.perspective(mat4.create(),
      //field of view, aspect ratio, near clipping, far clipping
      Math.PI/2, canvas.width/canvas.height, 0.1, 30
    );

    //initialize shaders
    this.shaderProgram = ShaderUtils.initShaders(gl, 'shaders/cube_lit.vert', 'shaders/fragment.frag'); //load shaders
    if (this.shaderProgram < 0) { alert('Unable to initialize shaders.'); return; }
    gl.useProgram(this.shaderProgram); //specify to use the shaders

    //grab handles for later (store in the program object to keep organized)
    this.shaderProgram.vertexPositionHandle = gl.getAttribLocation(this.shaderProgram, "aPosition");
    this.shaderProgram.vertexNormalHandle = gl.getAttribLocation(this.shaderProgram,"aNormal");
    this.shaderProgram.colorHandle = gl.getUniformLocation(this.shaderProgram,"uColor");
    this.shaderProgram.normalMatrixHandle = gl.getUniformLocation(this.shaderProgram,"uNormalMatrix");
    this.shaderProgram.MVPmatrixHandle = gl.getUniformLocation(this.shaderProgram,"uModelViewProjectionMatrix");

    //initialize buffers from model data
    cube.vertexPositionBuffer = gl.createBuffer(); //positions
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);
    cube.vertexNormalBuffer = gl.createBuffer(); //normals
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);


    /**
     * Draw the cube model with the given model transform and color.
     * Uses the renderer's current view and projection transforms.
     * [drawCube description]
     * @param  {mat4} modelMatrix 
     * @param  {vec4} color
     */
    this.drawCube = function(modelMatrix, color)
    {
      //vertex attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexPositionBuffer);
      gl.vertexAttribPointer(this.shaderProgram.vertexPositionHandle, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.shaderProgram.vertexPositionHandle);
      gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexNormalBuffer);
      gl.vertexAttribPointer(this.shaderProgram.vertexNormalHandle, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.shaderProgram.vertexNormalHandle);

      //set color
      gl.uniform4fv(this.shaderProgram.colorHandle, color);

      //calculate and set normal matrix
      var normalMatrix = mat3.normalFromMat4(mat3.create(), modelMatrix);
      gl.uniformMatrix3fv(this.shaderProgram.normalMatrixHandle, false, normalMatrix);

      //calculate and set MVP matrix
      var MVPmatrix = mat4.mul(mat4.create(), this.viewMatrix, modelMatrix); //modelview 
      mat4.mul(MVPmatrix, this.projectionMatrix, MVPmatrix);
      gl.uniformMatrix4fv(this.shaderProgram.MVPmatrixHandle, false, MVPmatrix);

      //draw the model!
      gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);
    };
}

/** The cube model **/
var cube = {
  numVertices : 36, //each triangle stored individually

  vertices : new Float32Array([
    //front face
    -1, 1, 1,    -1, -1, 1,   1, 1, 1, 
    -1, -1, 1,   1, -1, 1,    1, 1, 1,

    //right face
    1, 1, 1,   1, -1, 1,    1, 1, -1,
    1, -1, 1,    1, -1, -1,   1, 1, -1,

    //back face
    1, 1, -1,    1, -1, -1,   -1, 1, -1,
    1, -1, -1,   -1, -1, -1,  -1, 1, -1,

    //left face
    -1, 1, -1,   -1, -1, -1,  -1, 1, 1, 
    -1, -1, -1,  -1, -1, 1,   -1, 1, 1, 

    //top face
    -1, 1, -1,   -1, 1, 1,    1, 1, -1, 
    -1, 1, 1,    1, 1, 1,     1, 1, -1,

    //bottom face
    1, -1, -1,   1, -1, 1,    -1, -1, -1,
    1, -1, 1,    -1, -1, 1,   -1, -1, -1
    ]),

  normals : new Float32Array([
    // Front face
    0, 0, 1,    0, 0, 1,    0, 0, 1,
    0, 0, 1,    0, 0, 1,    0, 0, 1,

    // Right face 
    1, 0, 0,    1, 0, 0,    1, 0, 0,
    1, 0, 0,    1, 0, 0,    1, 0, 0,

    // Back face 
    0, 0, -1,   0, 0, -1,    0, 0, -1,
    0, 0, -1,   0, 0, -1,    0, 0, -1,

    // Left face 
    -1, 0, 0,   -1, 0, 0,   -1, 0, 0,
    -1, 0, 0,   -1, 0, 0,   -1, 0, 0,

    // Top face 
    0, 1, 0,    0, 1, 0,    0, 1, 0,
    0, 1, 0,    0, 1, 0,    0, 1, 0,

    // Bottom face 
    0, -1, 0,   0, -1, 0,    0, -1, 0,
    0, -1, 0,   0, -1, 0,    0, -1, 0   
    ]),

  colors: new Float32Array([ //for per-face colors; useful for testing
    //front face
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,

    //right face
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,

    //back face
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,

    //left face
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,

    //top face
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,

    //bottom face
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1

  ])
}; //end cube
