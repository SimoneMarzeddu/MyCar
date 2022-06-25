/*
the FollowFromUpCamera always look at the car from a position abova right over the car
*/
FollowFromUpCamera = function () {

	//posizione del punto di vista attuale
	this.eyePos = glMatrix.vec3.fromValues(0, 50, 0);
	//posizione del target attuale
	this.targetPos = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
	this.upV = glMatrix.vec4.fromValues(0.0, 0.0, -1, 0.0);

	/* the only data it needs is the position of the camera */
	this.frame = glMatrix.mat4.create();

	/* update the camera with the current car position */
	this.update = function (car_position) {
		this.frame = car_position;
	}
	this.view = function(){
		let occhio = glMatrix.vec3.create();
		let punto_target = glMatrix.vec3.create();
		glMatrix.vec3.transformMat4(occhio, this.eyePos, this.frame)
		glMatrix.vec3.transformMat4(punto_target, this.targetPos, this.frame)

		return glMatrix.vec3.sub(glMatrix.vec3.create(), punto_target , occhio);
	}
	this.get_upVec = function(){
		return this.upV;
	}
	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function () {
		let eye = glMatrix.vec3.create();
		let target = glMatrix.vec3.create();
		let up = glMatrix.vec4.create();

		glMatrix.vec3.transformMat4(eye, this.eyePos, this.frame);
		glMatrix.vec3.transformMat4(target, this.targetPos, this.frame);
		glMatrix.vec4.transformMat4(up, this.upV, this.frame);

		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), eye, target, up.slice(0, 3));
	}
}
/*
the ChaseCamera always look at the car from behind the car, slightly above
*/
ChaseCamera = function () {

	//posizione del punto di vista attuale
	this.eyePos = glMatrix.vec3.fromValues(0, 4, 9);
	//posizione del target attuale
	this.targetPos = glMatrix.vec3.fromValues(0, 2, 0);
	this.upV = glMatrix.vec4.fromValues(0, 0, -1, 0);

	/* the only data it needs is the position of the camera */
	this.frame = glMatrix.mat4.create();

	/* update the camera with the current car position */
	this.update = function (car_frame) {
		this.frame = car_frame.slice();
	}
	this.get_upVec = function(){
		return glMatrix.vec4.fromValues(0, 1, 0, 0);
	}

	this.view = function(){
		let occhio = glMatrix.vec3.create();
		let punto_target = glMatrix.vec3.create();
		glMatrix.vec3.transformMat4(occhio, this.eyePos, this.frame)
		glMatrix.vec3.transformMat4(punto_target, this.targetPos, this.frame)

		return glMatrix.vec3.sub(glMatrix.vec3.create(), punto_target , occhio);
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function () {
		let occhio = glMatrix.vec3.create();
		let punto_target = glMatrix.vec3.create();
		let up = glMatrix.vec4.create();
		glMatrix.vec3.transformMat4(occhio, this.eyePos, this.frame)
		glMatrix.vec3.transformMat4(punto_target, this.targetPos, this.frame)
		glMatrix.vec4.transformMat4(up, this.upV, this.frame);
		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), //output
			occhio, // posizione occhio
			punto_target, // punto da guardare
			up.slice(0, 3)); // pointing up	
	}
}
/*
La FreeCamera è la camera libera controllabile con mouse e tastiera
*/
FreeCamera = function () {

	this.frame = glMatrix.mat4.create();

	this.keys = [];
	this.angles = [];
	//target della vista quando il mouse è al centro del canvas
	this.targetO = glMatrix.vec3.fromValues(0, 4, 5);
	//posizione del punto di vista attuale
	this.eyePos = glMatrix.vec3.fromValues(0, 5, 0);
	//posizione del target attuale
	this.targetPos = glMatrix.vec3.fromValues(0, 5, 5);
	this.upV = glMatrix.vec3.fromValues(0, 1, 0);

	this.view = function() {
		return glMatrix.vec3.sub(glMatrix.vec3.create(), this.targetPos, this.eyePos);
	}
	this.get_upVec = function(){
		return this.upV;
	}
	//aggiornamento dei parameteri della camera
	this.update = function () {
		//variabile temporanea
		let tmp_var = glMatrix.vec3.create();
		//traslazione composta da applicare al frame
		let tras = glMatrix.mat4.create();

		//inverso della direzione di vista
		let menoVista = glMatrix.vec3.sub(glMatrix.vec3.create(), this.eyePos, this.targetO);

		//rotazione orizzontale imposta dalla posizione del mouse
		let rot = glMatrix.mat4.fromRotation(glMatrix.mat4.create(), this.angles['h'], this.upV);

		//rotazione verticale imposta dalla posizione del mouse
		//asse di rotazione
		let HAxes = glMatrix.vec3.cross(glMatrix.vec3.create(), this.upV, menoVista);

		glMatrix.mat4.mul(rot, rot, glMatrix.mat4.fromRotation(glMatrix.mat4.create(), this.angles['v'], HAxes));
		//applichiamo tutte le rotazioni
		this.targetPos = glMatrix.vec3.transformMat4(this.targetPos, this.targetO, rot);

		//SETUP traslazione frame da tastiera
		//direzione di vista
		glMatrix.vec3.sub(tmp_var, this.targetPos, this.eyePos);
		glMatrix.vec3.normalize(tmp_var, tmp_var);
		glMatrix.vec3.scale(tmp_var, tmp_var, 0.2);//"regolazione della velocità della camera"
		//traslazioni da applicare in base ai tasti input
		if (this.keys['a']) {//sinistra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), this.upV, tmp_var);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		} else if (this.keys['d']) {//destra
			let vS = glMatrix.vec3.cross(glMatrix.vec3.create(), tmp_var, this.upV);
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), vS));
		}
		else if (this.keys['w']) {//avanti (verso il target attuale)
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), tmp_var));
		} else if (this.keys['s']) {//indietro (allontanandosi dal target attuale)
			glMatrix.vec3.scale(tmp_var, tmp_var, -1);//inversione della direzione
			glMatrix.mat4.mul(tras, tras, glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), tmp_var));
		}
		//applichiamo la trasformazione
		glMatrix.mat4.mul(this.frame, this.frame, tras);
	}

	//resetta il frame della camera
	this.reset = function () {
		this.frame = glMatrix.mat4.create();
	}

	/* return the transformation matrix to transform from warlord coordiantes to the view reference frame */
	this.matrix = function () {

		let occhio = glMatrix.vec3.create();
		let target = glMatrix.vec3.create();

		glMatrix.vec3.transformMat4(occhio, this.eyePos, this.frame);
		glMatrix.vec3.transformMat4(target, this.targetPos, this.frame);

		return glMatrix.mat4.lookAt(glMatrix.mat4.create(), //output
			occhio, // posizione occhio
			target, // punto da guardare
			this.upV); // pointing up	
	}
}

/* the main object to be implementd */
var Renderer = new Object();

/* array of cameras that will be used */
Renderer.cameras = [];
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
var FreeCam = new FreeCamera();
Renderer.cameras.push(FreeCam);

// set the camera currently in use
Renderer.currentCamera = 0;

Renderer.createObjectBuffers = function (gl, obj) {

	obj.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (typeof obj.texCoords != 'undefined') {
		obj.texCoordsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.tangents != 'undefined') {
		obj.tangentsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.tangents, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (typeof obj.normals != 'undefined') {
		obj.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	obj.indexBufferTriangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	// create edges
	var edges = new Uint16Array(obj.numTriangles * 3 * 2);
	for (var i = 0; i < obj.numTriangles; ++i) {
		edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
		edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
	}

	obj.indexBufferEdges = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
Renderer.createFramebuffer = function (gl, size) {
	
	var depthTexture = gl.createTexture();
	const depthTextureSize = size;
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,    // type
		null);              // data

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var depthFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0);                   // mip level

	// create a color texture of the same size as the depth texture
	var colorTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, colorTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		depthTextureSize,
		depthTextureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// attach it to the framebuffer
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,        // target
		gl.COLOR_ATTACHMENT0,  // attachment point
		gl.TEXTURE_2D,         // texture target
		colorTexture,         // texture
		0);                    // mip level

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	depthFramebuffer.depthTexture = depthTexture;
	depthFramebuffer.colorTexture = colorTexture;
	depthFramebuffer.size = depthTextureSize;

	return depthFramebuffer;
};
//"Disegna" un oggetto con lo shader di profondità
Renderer.drawShadowObject = function (gl, obj) {

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(this.shaderDepth.aPositionIndex);
	gl.vertexAttribPointer(this.shaderDepth.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
//Disegna un oggetto con lo shader standard
Renderer.drawObject = function (gl, obj, fillColor, coeffD, coeffS, coeffT, kEm, shading, lineColor) {

	//passo allo shader il coefficiente per la componente diffusa della luce
	if (coeffD != undefined) { gl.uniform3fv(this.uniformShader.uKDiffuseLocation, coeffD); }
	else { gl.uniform3fv(this.uniformShader.uKDiffuseLocation, CPStandardD); }
	//passo allo shader il coefficiente per la componente speculare della luce
	if (coeffS != undefined) { gl.uniform4fv(this.uniformShader.uKSpecularLocation, coeffS); }
	else { gl.uniform4fv(this.uniformShader.uKSpecularLocation, CPStandardS); }
	//passo allo shader il coefficiente per la quantità di colore della texture
	if (coeffT != undefined) { gl.uniform1f(this.uniformShader.uKTextureLocation, coeffT); }
	else { gl.uniform1f(this.uniformShader.uKTextureLocation, 0.8); }
	//passo allo shader il coefficiente per la componente emissiva della luce
	if (kEm != undefined) { gl.uniform3fv(this.uniformShader.uKEmLocation, kEm); }
	else { gl.uniform3fv(this.uniformShader.uKEmLocation, [0.0, 0.0, 0.0]); }
	//passo allo shader un valore per la modalità di shading  0->Phong  -  1->Flat
	if (shading != undefined) { gl.uniform1i(this.uniformShader.uShTypeLocation, shading); }
	else { gl.uniform1i(this.uniformShader.uShTypeLocation, 1); }

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
	gl.vertexAttribPointer(this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

	if (typeof obj.normals != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aNormalIndex);
		gl.vertexAttribPointer(this.uniformShader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
	}

	if (typeof obj.texCoords != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aTexCoordsIndex);
		gl.vertexAttribPointer(this.uniformShader.aTexCoordsIndex, 2, gl.FLOAT, false, 0, 0);
	}

	if (typeof obj.tangentsBuffer != 'undefined') {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
		gl.enableVertexAttribArray(this.uniformShader.aTangentsIndex);
		gl.vertexAttribPointer(this.uniformShader.aTangentsIndex, 3, gl.FLOAT, false, 0, 0);
	}

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.uniform4fv(this.uniformShader.uColorLocation, fillColor);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	if (lineColor != undefined) {
		gl.uniform4fv(this.uniformShader.uColorLocation, lineColor);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
		gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.disableVertexAttribArray(this.uniformShader.aPositionIndex);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
};
//Inizializza gli oggetti che sranno poi diseganti nella scena
Renderer.initializeObjects = function (gl) {
	//estensioni di WebGL
	gl.getExtension('OES_standard_derivatives');
	gl.getExtension('WEBGL_depth_texture');

	//variabili che memorizzano la palette di colori della macchina
	ruotaColor = [41 / 255, 47 / 255, 50 / 255, 1];
	piruloColor = [93 / 255, 93 / 255, 93 / 255, 1]
	telaioColor = [110 / 255, 190 / 255, 245 / 255, 1];
	finestrinoColor = [1, 251 / 255, 251 / 255, 1];

	//coefficienti standard per presenza o assenza di texture
	CTuntextured = 0.0;// no contributo texture
	CTtextured = 1.0;// si contributo texture
	CTsofttextured = 0.3;// leggero contributo texture

	//coefficienti per l'illuminazione dei diversi materiali
	CPGommaD = [1, 0.3, 0.2];//diffusivo
	CPGommaS = [0.3, 0.05, 0.0, 5.0];//speculare

	CPlucidoD = [1, 0.3, 0.2];//diffusivo
	CPlucidoS = [1.0, 0.3, 0.0, 71.0];//speculare

	//coefficienti luce solare standard
	CPStandardD = [1, 0.2, 0.1];//diffusivo
	CPStandardS = [0.9, 0.1, 0.1, 71.0];//speculare

	Game.setScene(scene_0);
	this.car = Game.addCar("mycar");

	//array di informazioni sui lampioni
	this.posArr = new Array(); //posizioni
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		let dummyA = [];
		dummyA.push(Game.scene.lamps[p].position[0]);
		dummyA.push(Game.scene.lamps[p].height);
		dummyA.push(Game.scene.lamps[p].position[2]);
		dummyA.push(1.0);
		this.posArr.push(dummyA);
	}

	this.dirArr = new Array(); //direzioni della luce
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		let dummyA = [];
		dummyA.push(0.0);
		dummyA.push(-1.0);
		dummyA.push(0.0);
		dummyA.push(0.0);
		this.dirArr.push(dummyA);
	}


	Renderer.triangle = new Triangle();

	//Cube2 è il classico cubo con la dupplicazione dei vertici utile alla correzione delle normali
	this.cube = new Cube2(0.5);
	ComputeNormals(this.cube);
	this.createObjectBuffers(gl, this.cube);
	//CubeRev è il classico cubo ma rovesciato
	this.cubeR = new CubeRev(1);
	ComputeNormals(this.cubeR);
	this.createObjectBuffers(gl, this.cubeR);
	//cylinder2 è il classico cilindro con la dupplicazione dei vertici utile alla correzione delle normali
	this.cylinder = new Cylinder2(25);
	ComputeNormals(this.cylinder);
	this.createObjectBuffers(gl, this.cylinder);

	ComputeNormals(Game.scene.trackObj);
	Renderer.createObjectBuffers(gl, Game.scene.trackObj);
	ComputeNormals(Game.scene.groundObj);
	Renderer.createObjectBuffers(gl, Game.scene.groundObj);

	for (var i = 0; i < Game.scene.buildings.length; ++i) {
		ComputeNormals(Game.scene.buildingsObjTex[i]);
		ComputeNormals(Game.scene.buildingsObjTex[i].roof);
		Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i]);
		Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof);
	}

	//caricamento delle texture
	Renderer.loadTexture(gl, 0, "../common/textures/terrain.jpg");
	Renderer.loadTexture(gl, 1, "../common/textures/street.png");
	Renderer.loadTexture(gl, 2, "../common/textures/facade.jpg");
	Renderer.loadTexture(gl, 3, "../common/textures/facade2.jpg");
	Renderer.loadTexture(gl, 4, "../common/textures/facade3.png");
	Renderer.loadTexture(gl, 5, "../common/textures/roof.jpg");
	Renderer.loadTexture(gl, 6, "../common/textures/headlight.png", 0);
	Renderer.loadTexture(gl, 10, "../common/textures/metallo.jpg");

	this.textureCubeMap = createCubeMap(9, gl,
		"../common/textures/cubemap/RedMap/posx.png",
		"../common/textures/cubemap/RedMap/negx.png",
		"../common/textures/cubemap/RedMap/posy.png",
		"../common/textures/cubemap/RedMap/negy.png",
		"../common/textures/cubemap/RedMap/posz.png",
		"../common/textures/cubemap/RedMap/negz.png");
};
setCubeFace = function (gl, texture, face, imgdata) {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgdata);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}
loadCubeFace = function (gl, texture, face, path) {
	var imgdata = new Image();
	imgdata.onload = function () {
		setCubeFace(gl, texture, face, imgdata);
	}
	imgdata.src = path;
}
createCubeMap = function (tu, gl, posx, negx, posy, negy, posz, negz) {
	texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0+tu);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	if (typeof posx != 'undefined') {
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_X, posx);
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, negx);
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, posy);
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, negy);
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, posz);
		loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, negz);
	} else {
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
	}


	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	return texture;
}
//Carica le texture utilizzate per la colorazione degli oggetti
Renderer.loadTexture = function (gl, tu, url, n) {
	var image = new Image();
	image.src = url;
	image.addEventListener('load', function () {
		gl.activeTexture(gl.TEXTURE0 + tu);
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		if (n == 0) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		//	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
		//	gl.generateMipmap(gl.TEXTURE_2D);
	});
};
//"Disegna" ogni componente della macchina utlizzando lo shader di profondità
Renderer.drawShadowCar = function (gl) {
	//telaio sopra
	Renderer.stack.push();
	let cubeScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(cubeScale, [3 / 5, 3 / 10, 1]);
	let cubeTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 7 / 5, 0.5]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	Renderer.stack.pop();

	//parabrezza
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [2.5 / 5, 2.5 / 10, 0.025]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 6.9 / 5, -0.526]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	Renderer.stack.pop();

	//finestrino destro
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [0.025, 2.5 / 10, 2 / 5]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0.6, 6.9 / 5, 0.05]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	Renderer.stack.pop();

	//finestrino sinistro
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [0.025, 2.5 / 10, 2 / 5]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [-0.6, 6.9 / 5, 0.05]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	Renderer.stack.pop();

	//telaio sotto
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [3.55 / 5, 2 / 5, 14 / 10]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 7 / 10, 1 / 5]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cube);
	Renderer.stack.pop();

	//fanale cover
	Renderer.stack.push();
	let fanRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(fanRotate, Math.PI / 2 , [1, 0, 0]);
	let fanScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(fanScale, [1.5 / 7, 1.5 / 7, 1.5 / 7]);
	let fanTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(fanTranslate, [0, 0.7, -1.27]);

	Renderer.stack.multiply(fanTranslate);
	Renderer.stack.multiply(fanScale);
	Renderer.stack.multiply(fanRotate);

	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//fanale lampadina
	Renderer.stack.push();
	fanRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(fanRotate, Math.PI / 2 - Math.PI / 20, [1, 0, 0]);
	fanScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(fanScale, [1.5 / 10, 1.5 / 10, 1.5 / 10]);
	fanTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(fanTranslate, [0, 0.7, -1.3]);

	Renderer.stack.multiply(fanTranslate);
	Renderer.stack.multiply(fanScale);
	Renderer.stack.multiply(fanRotate);

	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//ruota davanti
	Renderer.stack.push();

	let cylRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(cylRotate, Math.PI / 2, [0, 0, 1]);

	//rotazione ruote
	let wheelsAngle_Mat = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(wheelsAngle_Mat, this.car.wheelsAngle, [0, 1, 0]);
	let wheelsRotation = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(wheelsRotation, this.car.wheelsSpeedAngle, [0, 1, 0]);

	let cylScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(cylScale, [0.5 / 5, 1.5 / 5, 1.5 / 5]);

	let cylTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cylTranslate, [1 / 10, 1.5 / 5, -3 / 5]);

	let cylCenter = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cylCenter, [0, -1, 0]);
	let cylCenterInv = glMatrix.mat4.create();
	glMatrix.mat4.invert(cylCenterInv, cylCenter);

	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);

	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//ruota posteriore destra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [-2.65 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);

	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//ruota posteriore sinistra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [3.65 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//pirulino ruota davanti
	Renderer.stack.push();
	glMatrix.mat4.fromRotation(cylRotate, Math.PI / 2, [0, 0, 1]);
	glMatrix.mat4.fromScaling(cylScale, [0.6 / 5, 0.75 / 5, 0.75 / 5]);
	glMatrix.mat4.fromTranslation(cylTranslate, [1.175 / 10, 1.5 / 5, -3 / 5]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//pirulino ruota posteriore destra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [-2.55 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//pirulino ruota posteriore sinistra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [3.75 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();
};
//Disegna ogni componente della macchina utlizzando lo shader standard
Renderer.drawCar = function (gl) {

	//multiply(A,B,C) -> A = B*C

	//telaio sopra
	Renderer.stack.push();
	let cubeScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(cubeScale, [3 / 5, 3 / 10, 1]);
	let cubeTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 7 / 5, 0.5]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cube, telaioColor, CPlucidoD, CPlucidoS, CTsofttextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//parabrezza
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [2.5 / 5, 2.5 / 10, 0.025]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 6.9 / 5, -0.526]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cube, finestrinoColor, CPlucidoD, CPlucidoS, CTuntextured, [1.0, 0.6, 0.0], 0);
	Renderer.stack.pop();

	//finestrino destro
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [0.025, 2.5 / 10, 2 / 5]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0.6, 6.9 / 5, 0.05]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cube, finestrinoColor, CPlucidoD, CPlucidoS, CTuntextured, [1.0, 0.6, 0.0], 0);
	Renderer.stack.pop();

	//finestrino sinistro
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [0.025, 2.5 / 10, 2 / 5]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [-0.6, 6.9 / 5, 0.05]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cube, finestrinoColor, CPlucidoD, CPlucidoS, CTuntextured, [1.0, 0.6, 0.0], 0);
	Renderer.stack.pop();

	//telaio sotto
	Renderer.stack.push();
	glMatrix.mat4.fromScaling(cubeScale, [3.55 / 5, 2 / 5, 14 / 10]);

	glMatrix.mat4.fromTranslation(cubeTranslate, [0, 7 / 10, 1 / 5]);
	Renderer.stack.multiply(cubeTranslate);
	Renderer.stack.multiply(cubeScale);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cube, telaioColor, CPlucidoD, CPlucidoS, CTsofttextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//fanale cover
	Renderer.stack.push();
	let fanRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(fanRotate, Math.PI / 2 , [1, 0, 0]);
	let fanScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(fanScale, [1.5 / 7, 1.5 / 7, 1.5 / 7]);
	let fanTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(fanTranslate, [0, 0.7, -1.27]);

	Renderer.stack.multiply(fanTranslate);
	Renderer.stack.multiply(fanScale);
	Renderer.stack.multiply(fanRotate);

	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, telaioColor, CPGommaD, CPGommaS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//fanale lampadina
	Renderer.stack.push();
	fanRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(fanRotate, Math.PI / 2 - Math.PI / 20, [1, 0, 0]);
	fanScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(fanScale, [1.5 / 10, 1.5 / 10, 1.5 / 10]);
	fanTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(fanTranslate, [0, 0.7, -1.3]);

	Renderer.stack.multiply(fanTranslate);
	Renderer.stack.multiply(fanScale);
	Renderer.stack.multiply(fanRotate);

	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, telaioColor, CPGommaD, CPGommaS, CTuntextured, [1.0, 0.6, 0.0], 0);
	Renderer.stack.pop();

	//ruota davanti
	Renderer.stack.push();

	let cylRotate = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(cylRotate, Math.PI / 2, [0, 0, 1]);

	//matrice per la rotazione delle ruote legata alla direzione di movimento della macchina
	let wheelsAngle_Mat = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(wheelsAngle_Mat, this.car.wheelsAngle, [0, 1, 0]);

	//matrice per la rotazione delle ruote legata alla velocità della macchina
	//wheelsSpeedAngle viene costantemente incrementato in base alla velocità attuale della macchina (modifiche in game.js)
	let wheelsRotation = glMatrix.mat4.create();
	glMatrix.mat4.fromRotation(wheelsRotation, this.car.wheelsSpeedAngle, [0, 1, 0]);

	let cylScale = glMatrix.mat4.create();
	glMatrix.mat4.fromScaling(cylScale, [0.5 / 5, 1.5 / 5, 1.5 / 5]);

	let cylTranslate = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cylTranslate, [1 / 10, 1.5 / 5, -3 / 5]);

	let cylCenter = glMatrix.mat4.create();
	glMatrix.mat4.fromTranslation(cylCenter, [0, -1, 0]);
	let cylCenterInv = glMatrix.mat4.create();
	glMatrix.mat4.invert(cylCenterInv, cylCenter);

	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);

	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPGommaD, CPGommaS, CTuntextured, [0.0, 0.0, 0.0],0);
	Renderer.stack.pop();

	//ruota posteriore destra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [-2.65 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);

	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPGommaD, CPGommaS, CTuntextured, [0.0, 0.0, 0.0],0);
	Renderer.stack.pop();

	//ruota posteriore sinistra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [3.65 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	Renderer.stack.multiply(wheelsRotation);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPGommaD, CPGommaS, CTuntextured, [0.0, 0.0, 0.0],0);
	Renderer.stack.pop();

	//pirulino ruota davanti
	Renderer.stack.push();
	glMatrix.mat4.fromRotation(cylRotate, Math.PI / 2, [0, 0, 1]);
	glMatrix.mat4.fromScaling(cylScale, [0.6 / 5, 0.75 / 5, 0.75 / 5]);
	glMatrix.mat4.fromTranslation(cylTranslate, [1.175 / 10, 1.5 / 5, -3 / 5]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, piruloColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//pirulino ruota posteriore destra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [-2.55 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, piruloColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//pirulino ruota posteriore sinistra
	Renderer.stack.push();
	glMatrix.mat4.fromTranslation(cylTranslate, [3.75 / 5, 1.5 / 5, 1]);
	Renderer.stack.multiply(cylTranslate);
	Renderer.stack.multiply(cylCenterInv);
	Renderer.stack.multiply(wheelsAngle_Mat);
	Renderer.stack.multiply(cylCenter);
	Renderer.stack.multiply(cylScale);
	Renderer.stack.multiply(cylRotate);
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, piruloColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();
};
//"Disegna" ogni componente di un faro utlizzando lo shader di profondità
Renderer.drawShadowLamp = function (gl) {

	//parte alta
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 4, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.7, 0.1, 0.7]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//lampadina
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 3.9, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//palo1
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 2, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 2, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();

	//palo2
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.1, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.1, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, Renderer.stack.matrix);
	this.drawShadowObject(gl, this.cylinder);
	Renderer.stack.pop();
};
//Disegna ogni componente di un faro utlizzando lo shader standard
Renderer.drawLamp = function (gl) {

	//parte alta
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 4, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.7, 0.1, 0.7]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//lampadina
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 3.9, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.5, 0.1, 0.5]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPlucidoD, CPlucidoS, CTuntextured, [1.0, 0.2, 0.1], 0);
	Renderer.stack.pop();

	//palo1
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 2, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.1, 2, 0.1]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();

	//palo2
	Renderer.stack.push();
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, 0.1, 0]));
	Renderer.stack.multiply(glMatrix.mat4.fromScaling(glMatrix.mat4.create(), [0.2, 0.1, 0.2]));
	Renderer.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [0, -1, 0]));
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, Renderer.stack.matrix);
	this.drawObject(gl, this.cylinder, ruotaColor, CPlucidoD, CPlucidoS, CTuntextured, [0.0, 0.0, 0.0], 0);
	Renderer.stack.pop();
};
//"Disegna" la scena utilizzando lo shader di profondità
Renderer.drawShadowScene = function (gl,faro) {

	gl.enable(gl.CULL_FACE);
	gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.framebuffer);
	gl.viewport(0, 0, Renderer.shadowMapSize, Renderer.shadowMapSize);
	gl.enable(gl.DEPTH_TEST);

	//gl.clearColor(0.34, 0.5, 0.74, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	

	gl.useProgram(Renderer.shaderDepth);

	//La LightMatrix equivale alla Matrice di vista per lo shader di profondità
	gl.uniformMatrix4fv(this.shaderDepth.uLightMatrixLocation, false, faro);
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);

	//Disegno la macchina
	this.stack.push();
	this.stack.multiply(this.car.frame);
	this.drawShadowCar(gl);
	this.stack.pop();

	//Disegno i lampioni
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		this.stack.push();
		this.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), Game.scene.lamps[p].position));
		this.drawShadowLamp(gl);
		this.stack.pop();
	}

	//Reset della ModelMatrix dello shader di profondità
	gl.uniformMatrix4fv(this.shaderDepth.uM, false, this.stack.matrix);

	//Disegno gli elementi statici della scena (terreno,strada e palazzi)
	this.drawShadowObject(gl, Game.scene.groundObj);
	this.drawShadowObject(gl, Game.scene.trackObj);

	for (var i in Game.scene.buildingsObj)
		this.drawShadowObject(gl, Game.scene.buildingsObjTex[i]);
	for (var i in Game.scene.buildingsObj)
		this.drawShadowObject(gl, Game.scene.buildingsObjTex[i].roof);

	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
};
//Disegna lo sfondo della scena
Renderer.drawSkybox = function(gl){
	gl.enable(gl.CULL_FACE);
	gl.viewport(0, 0, canvasW, canvasH);
	gl.enable(gl.DEPTH_TEST);

	gl.useProgram(this.shaderCubemap);

	let l = -0.1;
	let r = 0.1;
	let b = -0.1;
	let t = 0.1;
	let n = 0.1;
	let f = 15.0;

	gl.uniformMatrix4fv(this.shaderCubemap.uViewMatrixLocation, false, glMatrix.mat4.lookAt(glMatrix.mat4.create(), [0.0,0.0,0.0], Renderer.cameras[Renderer.currentCamera].view(), Renderer.cameras[Renderer.currentCamera].get_upVec()));
	gl.uniformMatrix4fv(this.shaderCubemap.uProjectionMatrixLocation, false, glMatrix.mat4.frustum(glMatrix.mat4.create(), l, r, b, t, n, f));

	//Passo allo shader apposito la texture dello Skybox
	gl.activeTexture(gl.TEXTURE9);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureCubeMap);
	gl.uniform1i(this.shaderCubemap.uSamplerCMLocation, 9);

	gl.depthMask(false);
	
	//Disegno il cubo
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeR.vertexBuffer);
	gl.enableVertexAttribArray(this.shaderCubemap.aPositionIndex);
	gl.vertexAttribPointer(this.shaderCubemap.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeR.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, this.cubeR.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.depthMask(true);
}
//Disegna la scena utilizzando lo shader standard
Renderer.drawScene = function (gl) {

	//Inizializzo lo Stack di matrici
	this.stack.loadIdentity();

	//Creo la matrice di vista rappresentante il punto di vista del FARO FRONTALE della macchina
	let posizione_lampadina = glMatrix.vec3.create();
	let target = glMatrix.vec3.create();
	let up = glMatrix.vec4.create();
	let faroFrame = glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.create(), this.car.frame);

	glMatrix.vec3.transformMat4(posizione_lampadina, [0.0, 0.7, -1.3, 1], faroFrame)
	glMatrix.vec3.transformMat4(target, [0.0, 0, -4, 1], faroFrame)
	glMatrix.vec4.transformMat4(up, [0.0, 1.0, 0.0, 0.0], faroFrame);

	let faro = glMatrix.mat4.lookAt(glMatrix.mat4.create(),
		posizione_lampadina,
		target, // punto verso cui la lampadina è direzionata
		up); // pointing up	
	let faroP = glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.perspective(glMatrix.mat4.create(), Math.PI / 2, 2, 0.05, 25), faro);

	//Preparazione allo shadow mapping per il faro della macchina
	this.drawShadowScene(gl,faroP);

	//Le informazioni elaborate nello shader di profomdità sono ora presenti nella texture di indice 11
	gl.activeTexture(gl.TEXTURE7);
	gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.depthTexture);
	gl.activeTexture(gl.TEXTURE8);
	gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.colorTexture);

	gl.enable(gl.CULL_FACE);
	var width = this.canvas.width;
	var height = this.canvas.height
	var ratio = width / height;
	gl.viewport(0, 0, width, height);
	gl.enable(gl.DEPTH_TEST);

	// Clear the framebuffer
	//gl.clearColor(1, 0.3, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Disegno la cubemap di fondo
	this.drawSkybox(gl);

	//Lo shader impostato è ora quello standard
	gl.useProgram(this.uniformShader);
	//Passo la matrice di proiezione allo shader standard
	gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false, glMatrix.mat4.perspective(glMatrix.mat4.create(), 3.14 / 4, ratio, 1, 500));
	//Effettuo l'aggiornamento della matrice di vista
	Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
	var invV = Renderer.cameras[Renderer.currentCamera].matrix();
	gl.uniformMatrix4fv(this.uniformShader.uViewMatrixLocation, false, invV);

	//Passo la direzione della luce del Sole allo shader standard
	gl.uniform3fv(this.uniformShader.uSunDirection, Game.scene.weather.sunLightDirection);

	//Elaboro e passo allo shader principale posizioni e direzioni dei lampioni
	let posArrView = [];
	let dirArrView = [];
	for(let n = 0; n<12; n++){
		let dummy1 = glMatrix.vec4.transformMat4(glMatrix.vec4.create(), this.posArr[n], invV);
		let dummy2 = glMatrix.vec4.transformMat4(glMatrix.vec4.create(), this.dirArr[n], invV);
		glMatrix.vec4.normalize(dummy2,dummy2);

		posArrView.push(dummy1[0]);
		posArrView.push(dummy1[1]);
		posArrView.push(dummy1[2]);

		dirArrView.push(dummy2[0]);
		dirArrView.push(dummy2[1]);
		dirArrView.push(dummy2[2]);
	}
	gl.uniform3fv(this.uniformShader.uLArrayPosLocation, posArrView);
	gl.uniform3fv(this.uniformShader.uLArrayDirLocation, dirArrView);

	//Passo allo shader principale le informazioni sul FARO FRONTALE della macchina
	gl.uniform1i(this.uniformShader.uSamplerFLocation, 6);
	gl.uniformMatrix4fv(this.uniformShader.uFaroLocation, false, faroP);
	gl.uniformMatrix4fv(this.uniformShader.uFaroViewLocation, false, faro);

	//Passo allo shader principale il risultato del calcolo avvenuto nello shader di profondità
	gl.uniform1i(this.uniformShader.uDepthSamplerLocation,7);

	//Disegno la macchina
	gl.uniform1i(this.uniformShader.uSamplerLocation, 10);
	this.stack.push();
	this.stack.multiply(this.car.frame);
	this.drawCar(gl);
	this.stack.pop();

	//Disegno i lampioni
	for (let p = 0; p < Game.scene.lamps.length; p++) {
		this.stack.push();
		this.stack.multiply(glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), Game.scene.lamps[p].position));
		this.drawLamp(gl);
		this.stack.pop();
	}

	//Reset della ModelMatrix dello shader di profondità
	gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, this.stack.matrix);

	//Disegno gli elementi statici della scena (terreno,strada e palazzi e tetti)
	gl.uniform1i(this.uniformShader.uSamplerLocation, 0);
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], CPStandardD, CPStandardS);
	gl.uniform1i(this.uniformShader.uSamplerLocation, 1);
	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], CPStandardD, CPStandardS);
	for (var i in Game.scene.buildingsObj) {
		if (i == 0) gl.uniform1i(this.uniformShader.uSamplerLocation, 4);
		else {
			if (i % 2 == 0) gl.uniform1i(this.uniformShader.uSamplerLocation, 2);
			else gl.uniform1i(this.uniformShader.uSamplerLocation, 3);
		}
		this.drawObject(gl, Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8, 1.0], CPStandardD, CPStandardS, CTtextured);
	}
	gl.uniform1i(this.uniformShader.uSamplerLocation, 5);
	for (var i in Game.scene.buildingsObj)
		this.drawObject(gl, Game.scene.buildingsObjTex[i].roof, [0.8, 0.8, 0.8, 1.0], CPStandardD, CPStandardS, CTtextured);

	gl.useProgram(null);
};
Renderer.Display = function () {
	Renderer.drawScene(Renderer.gl);
	window.requestAnimationFrame(Renderer.Display);
};
Renderer.setupAndStart = function () {
	/* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
	//regolazione dimensioni canvas
	Renderer.canvas.width = document.body.clientWidth - 30;
	Renderer.canvas.height = document.body.clientHeight - 130;
	canvasW = Renderer.canvas.width;
	canvasH = Renderer.canvas.height;

	/* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

	/* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION);
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: " + GLSL_version);

	//messaggio di benvenuto

	log("Premi SPAZIO per cambiare camera");

	/* create the matrix stack */
	Renderer.stack = new MatrixStack();

	/* initialize objects to be rendered */
	Renderer.initializeObjects(Renderer.gl);

	/* create the shaders */
	Renderer.uniformShader = new uniformShader(Renderer.gl);

	Renderer.shaderDepth = new shaderDepth(Renderer.gl);
	Renderer.shadowMapSize = 512.0;
	Renderer.framebuffer = Renderer.createFramebuffer(Renderer.gl,Renderer.shadowMapSize);

	Renderer.shaderCubemap = new shaderCubemap(Renderer.gl);

	/*
	add listeners for the mouse / keyboard events
	*/
	Renderer.canvas.addEventListener('mousemove', on_mouseMove, false);
	Renderer.canvas.addEventListener('keydown', on_keydown, false);
	Renderer.canvas.addEventListener('keyup', on_keyup, false);

	Renderer.Display();
}
on_mouseMove = function (e) {
	//calcolo dei radianti relativamente all'angolo orizzontale
	FreeCam.angles['h'] = (e.offsetX / canvasW) * 2 * Math.PI - Math.PI;
	//calcolo dei radianti relativamente all'angolo verticale
	FreeCam.angles['v'] = (e.offsetY / canvasH) * Math.PI / 2 - Math.PI / 4;
}
on_keyup = function (e) {

	if (e.key == ' ') {
		Renderer.currentCamera = (Renderer.currentCamera + 1) % Renderer.cameras.length;
		log("CAMBIO Camera effettuato: Camera " + Renderer.currentCamera);
	}
	if (e.key == 'w' || e.key == 'a' || e.key == 's' || e.key == 'd') {
		FreeCam.keys[e.key] = false;
	} if (e.key == 'r') {
		FreeCam.reset();
		log("RESET Della Camera libera effettuato");
	}

	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function (e) {

	if (e.key == 'w' || e.key == 'a' || e.key == 's' || e.key == 'd') {
		FreeCam.keys[e.key] = true;
	}

	Renderer.car.control_keys[e.key] = true;
}
window.onload = Renderer.setupAndStart;
