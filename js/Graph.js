if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var camera, scene, renderer, params, controls;

var solid, disk, lines, region;

var xRange = 10, yRange = 10;

var equationType = {

    EQUATION_NONE: 0,
    EQUATION_X: 1,
    EQUATION_Y: 2,
    EQUATION_INVALID: 3

};

var topEquation, botEquation, leftBound, rightBound, rotateAxis;

var options = {
    Example: 0
};



class Equation {

    constructor( expr, name ) {

        this.expr = expr;
        this.name = name;
        this.type = getEquationType( expr, name );
        try {

            this.value = math.eval( expr );
            this.constant = true;

        } catch(error) {

            this.value = undefined;
            this.constant = false;

        }

    }

}


init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 0, 30 );
    scene.add( camera );

    var light = new THREE.PointLight( 0xFFFFFF );
    // light.position.set( 10, 0, 25 );
    camera.add( light );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.minDistance = 20;
    // controls.maxDistance = 50;
    // controls.maxPolarAngle = Math.PI / 2;
    controls.target.set( 0, 0, 0 );
    controls.update();


    window.addEventListener( 'resize', onWindowResize, false );


    // Helpers
    // scene.add( new THREE.AxesHelper( 20 ) );
	var gridXY = new THREE.GridHelper( 2 * xRange, 2 * yRange, 0xFF0000, 0xFFFFFF);
	// gridXY.position.set( 100,100,0 );
	gridXY.rotation.x = Math.PI/2;
	// gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
	scene.add(gridXY);



    // dat gui

    params = {

        equation1: '',
        equation2: '',
        boundary1: '',
        boundary2: '',
        axis: '',
        displaySolid: true,
        opacity: 1.0,
        displaySection: false,
        drawFunction: function () {

            scene.remove( lines );
            lines = new THREE.Group();
            scene.add( lines );

            scene.remove( region );
            region = new THREE.Group();
            scene.add( region );

            drawFunction();


        },
        rotate: function () {

            scene.remove( solid );
            solid = new THREE.Group();
            scene.add( solid );

            scene.remove( disk );
            disk = new THREE.Group();
            scene.add( disk );

            solid.visible = this.displaySolid;
            disk.visible = this.displaySection;
            try {
                region.visible = !solid.visible;
            } catch ( e ) {}

            drawSolid();
        },
        clear: function () {
            clear();
        }


    };


    // var params = new ParaInput();

    var gui = new dat.GUI();

    var examples = {
        Choose: 0,
        Example1: 1,
        Example2: 2,
        Example3: 3,
        Example4: 4,
        Example5: 5,
        Example6: 6,
        Example7: 7,
        Example8: 8,
        Example9: 9
    };

    var exList = [

        {
            equation1: '',
            equation2: '',
            boundary1: '',
            boundary2: '',
            axis: '',
        },
        {
            equation1: 'y=sqrt(x)',
            equation2: 'y=0',
            boundary1: 'x=0',
            boundary2: 'x=4',
            axis: 'y=0',
        },
        {
            equation1: 'y=sqrt(16-x^2)',
            equation2: 'y=0',
            boundary1: 'x=-4',
            boundary2: 'x=4',
            axis: 'y=0',
        },
        {
            equation1: 'y=sqrt(x)',
            equation2: 'y=1',
            boundary1: 'x=1',
            boundary2: 'x=4',
            axis: 'y=1',
        },
        {
            equation1: 'x=2/y',
            equation2: 'x=0',
            boundary1: 'y=1',
            boundary2: 'y=4',
            axis: 'x=0',
        },
        {
            equation1: 'x=y^2+1',
            equation2: 'x=3',
            boundary1: 'y=-sqrt(2)',
            boundary2: 'y=sqrt(2)',
            axis: 'x=3',
        },
        {
            equation1: 'y=x^2+1',
            equation2: 'y=-x+3',
            boundary1: 'x=-2',
            boundary2: 'x=1',
            axis: 'y=0',
        },
        {
            equation1: 'x=sqrt(y)',
            equation2: 'x=y/2',
            boundary1: 'y=0',
            boundary2: 'y=4',
            axis: 'x=0',
        },
        {
            equation1: 'y=3x-x^2',
            equation2: 'y=0',
            boundary1: 'x=0',
            boundary2: 'x=3',
            axis: 'x=-1',
        },
        {
            equation1: 'y=sqrt(x)',
            equation2: 'y=0',
            boundary1: 'x=0',
            boundary2: 'x=4',
            axis: 'x=0',
        },


    ];

    gui.add( options, 'Example', examples ).onChange(
        function( value ) {
            clear();
            params.equation1 = exList[value].equation1;
            params.equation2 = exList[value].equation2;
            params.boundary1 = exList[value].boundary1;
            params.boundary2 = exList[value].boundary2;
            params.axis = exList[value].axis;
        }
    );

    gui.add( params, 'equation1' ).onFinishChange(
        function( value ) {


        }
    );
    gui.add( params, 'equation2' ).onFinishChange(
        function( value ) {


        }
    );
    gui.add( params, 'boundary1' ).onFinishChange(
        function( value ) {


        }
    );
    gui.add( params, 'boundary2' ).onFinishChange(
        function( value ) {


        }
    );
    gui.add( params, 'axis' ).onFinishChange(
        function( value ) {


        }
    );

    gui.add( params, 'displaySolid' ).onChange(
        function(value) {
            solid.visible = value;
            region.visible = !solid.visible;
        }
    );

    gui.add( params, 'opacity', 0, 1 ).onChange(
        function(value) {
                scene.remove(solid);
                solid = new THREE.Group();
                scene.add( solid );

                drawSolid();
                solid.visible = params.displaySolid;



        }
    );
    gui.add( params, 'displaySection' ).onChange(
        function(value) {
            disk.visible = value;
        }
    );


    gui.add(params, 'drawFunction');
    gui.add(params, 'rotate');
    gui.add(params, 'clear');

    for (let i in gui.__controllers) {
        gui.__controllers[i].listen();
    }

}

function clear () {

    scene.remove( solid );
    scene.remove( disk );
    scene.remove( lines );
    scene.remove( region );
    controls.reset();

}

function initEquations() {


    if ( params.equation1.replace(/\s/g, '') === params.equation2.replace(/\s/g, '') ) {
		sweetAlert("Malformed equation", "Two equations are the same!", "error");
    }

    if ( params.boundary1.replace(/\s/g, '') === params.boundary2.replace(/\s/g, '') ) {
		sweetAlert("Malformed equation", "Two boudaries are the same!", "error");
    }

    topEquation = new Equation( params.equation1, "First equation" );
    botEquation = new Equation( params.equation2, "Second equation" );
    leftBound = new Equation( params.boundary1, 'Boundary 1');
    rightBound = new Equation( params.boundary2, 'Boundary 2');
    rotateAxis = new Equation( params.axis, 'Rotation axis');

    if ( topEquation.type === equationType.EQUATION_NONE ) {
		sweetAlert("Malformed equation", "You should type in the first equation", "error");
    }

    if ( topEquation.type !== botEquation.type ) {
		sweetAlert("Malformed equation", "Two equations should have the same type", "error");
    }

    if ( topEquation.type === rotateAxis.type && topEquation.value === rotateAxis.value ) {
        [ topEquation, botEquation ] = [ botEquation, topEquation];
    }

    if ( leftBound.type !== rightBound.type ) {
		sweetAlert("Malformed equation", "Two boudaries should have the same type", "error");
    }

    if ( leftBound.type === topEquation.type ) {
        sweetAlert( "Boundary Error", "You need to define boudaries by independent variable", "error");
    }

    if ( leftBound.value > rightBound.value) {
        [ leftBound, rightBound ] = [ rightBound,  leftBound ];
    }


}

function getPoints( equation, left, right ) {

    let type = equation.type;
    // let name = equation.name;

    let points = [];
    const imax = 400;

    if ( type === equationType.EQUATION_Y) {

        // for ( let x = -xRange; x <= xRange; x = ( x + 0.1 ).toFixed(2) ) {
        for ( let i = 0; i <= imax; i++ ) {

            let x = left + ( right - left )/imax*i;
            let scope = { x: x };
            let y = math.eval( equation.expr, scope );
            try { //remove the numbers who are not in the domain.

                // y = y.toFixed(4);
                let v2 = new THREE.Vector2( x, y );
                if ( y <= yRange && y >= -yRange ) {
                    points.push( v2 );
                }

            } catch( error ){}

        }

    } else if ( type === equationType.EQUATION_X ) {

        // for ( let y = -yRange; y <= yRange; y = ( y + 0.1 ).toFixed(2) ) {
        for ( let i = 0; i <= imax; i++ ) {

            let y = left + ( right - left )/imax*i;
            let scope = { y: y };
            let x = math.eval( equation.expr, scope );
            try {  //remove the numbers who are not in the domain.

                // x = x.toFixed(4);
                let v2 = new THREE.Vector2( x, y );
                if ( x <= xRange && x >= -xRange - 0.01 ) {
                    points.push( v2 );
                }

            } catch( error ){}

        }

    }

    return points;

}

function getEquationType( equation, name ) {

    equation = equation.split(/=\s*/);

    if ( equation.length > 2 ) {

		sweetAlert("Malformed equation", "The " + name + " cannot have more than one equals sign", "error");
		return equationType.EQUATION_INVALID;

	} else if ( equation.length === 2 && equation[0].trim() === "x" ) {

        return equationType.EQUATION_X;

	} else if ( equation.length === 1 && equation[0].trim() !== "" || equation[0].trim() === "y" ) {

		return equationType.EQUATION_Y;

	} else if ( equation[0].trim() !== "" ) {

		sweetAlert("Invalid equation type", "The " + name + " should be a function of x or y", "error");
		return equationType.EQUATION_INVALID;

	}

    sweetAlert("Invalid equation type", "The " + name + " should be a function of x or y", "error");
	return equationType.EQUATION_NONE;
}

function drawFunction() {

    initEquations();

    var points1 = getPoints( topEquation, -xRange, xRange );
    var points2 = getPoints( botEquation, -xRange, xRange );

    // draw equation 1

    var geometry = new THREE.Geometry();

    for ( let i = 0; i < points1.length; i++ ) {

        geometry.vertices.push( new THREE.Vector3( points1[i].x, points1[i].y, 0 ) );

    }

    var line1 = new THREE.Line( geometry, new THREE.LineBasicMaterial({ color: 0x00ffff }) );

    // draw equation 2

    var geometry = new THREE.Geometry();

    for ( let i = 0; i < points2.length; i++ ) {

        geometry.vertices.push( new THREE.Vector3( points2[i].x, points2[i].y, 0 ) );

    }

    var line2 = new THREE.Line( geometry, new THREE.LineBasicMaterial({ color: 0x7fffd4 }) );

    lines.add( line1, line2 );

    var geometry = new THREE.Geometry();
    if ( rotateAxis.type === equationType.EQUATION_X) {

        geometry.vertices.push( new THREE.Vector3( rotateAxis.value, -10, 0 ), new THREE.Vector3( rotateAxis.value, 10, 0 ))

    } else {

        geometry.vertices.push( new THREE.Vector3( -10, rotateAxis.value, 0 ), new THREE.Vector3( 10, rotateAxis.value, 0 ))

    }

    var rotateAxisLine = new THREE.Line( geometry, new THREE.LineDashedMaterial({ color: 0xffa500 }) );

    lines.add( rotateAxisLine );

    // region

    var topPoints = getPoints( topEquation, leftBound.value, rightBound.value);
    var botPoints = getPoints( botEquation, leftBound.value, rightBound.value);
    var shapePoints = topPoints.concat(botPoints.reverse());
    var regionShape = new THREE.Shape(shapePoints);
    var geometry = new THREE.ShapeGeometry(regionShape);
    var material = new THREE.MeshBasicMaterial( { color: 0x00fff0 } );
    region.add( new THREE.Mesh( geometry, material ) );

}


function drawSolid() {

    initEquations();

    const halfPi = Math.PI * 0.5;
    const twoPi = Math.PI * 2;

    var geometry, mesh;
    var material = new THREE.MeshPhongMaterial( { color: 0x7CFC00, side: THREE.DoubleSide, transparent: true, opacity: params.opacity } );


    // var topPoints = getSolidPoints( topEquation, leftBound, rightBound, rotateAxis );
    // var botPoints = getSolidPoints( botEquation, leftBound, rightBound, rotateAxis );
    // var shapePoints = topPoints.concat(botPoints.reverse());
    // var regionShape = new THREE.Shape(shapePoints);
    // geometry = new THREE.ShapeGeometry(regionShape);
    // var mesh1 = new THREE.Mesh( geometry, material );
    // if ( rotateAxis.type === equationType.EQUATION_Y ) {

        // mesh1.rotation.y = Math.PI;

    // }
    // var mesh2 = mesh1.clone();
    // mesh2.rotation.y = angle;
    // solid.add( mesh1, mesh2 );

    if ( leftBound.type !== rotateAxis.type ) {

        // Disk method: boudaries are perpendicular to rotate axis
        var topEqPoints = getSolidPoints( topEquation, leftBound, rightBound, rotateAxis );
        var last = topEqPoints.length - 1;
        var botEqPoints;

        if ( botEquation.type === rotateAxis.type && botEquation.value === rotateAxis.value) {

            botEqPoints = undefined;

        } else {

            botEqPoints = getSolidPoints( botEquation, leftBound, rightBound, rotateAxis );

        }

        if (botEqPoints === undefined) {

            // Revolution without hole

            // side
            geometry = new THREE.LatheGeometry( topEqPoints, 100 );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, 0, 0 );
            solid.add( mesh );

            // Bottom base
            let botRadius = Math.abs( topEqPoints[0].x );
            if (botRadius) {
                geometry = new THREE.CircleGeometry( botRadius, 100, 0, twoPi);
                mesh = new THREE.Mesh( geometry, material );
                mesh.position.set( 0, topEqPoints[0].y, 0 );
                mesh.rotation.set( halfPi, 0, 0 );
                solid.add( mesh );
            }

            // Top base
            let topRadius = Math.abs( topEqPoints[last].x );
            if (topRadius) {
                geometry = new THREE.CircleGeometry( topRadius, 100, 0, twoPi);
                mesh = new THREE.Mesh( geometry, material );
                mesh.position.set( 0, topEqPoints[last].y, 0 );
                mesh.rotation.set( halfPi, 0, 0 );
                solid.add( mesh );
            }

            //Disk
            let diskRadius = Math.abs( topEqPoints[last/2].x );
            geometry = new THREE.CircleGeometry( diskRadius, 100, 0, twoPi);
            mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xFF0000, side: THREE.DoubleSide } ) );
            mesh.position.set( 0, topEqPoints[last/2].y, 0 );
            mesh.rotation.set( halfPi, 0, 0 );
            disk.add( mesh );


        } else {

            // Revolution with hole

            // Lathegeometry rotates around Y axis

            // Inner side
            geometry = new THREE.LatheGeometry( botEqPoints, 100 );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, 0, 0 );
            solid.add(mesh);


            // Outer side
            geometry = new THREE.LatheGeometry( topEqPoints, 100 );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, 0, 0 );
            solid.add(mesh);

            let innerRadius, outerRadius;
            // Bottom base
            innerRadius = Math.abs( botEqPoints[0].x );
            outerRadius = Math.abs( topEqPoints[0].x );

            if ( innerRadius > outerRadius) {

                [ innerRadius, outerRadius ] = [ outerRadius, innerRadius ];

            }

            if ( innerRadius !== outerRadius) {
                geometry = new THREE.RingGeometry( innerRadius, outerRadius, 100, 8, 0, twoPi);
                mesh = new THREE.Mesh( geometry, material );
                mesh.position.set( 0, topEqPoints[0].y, 0 );
                mesh.rotation.set( halfPi, 0, 0 );
                solid.add(mesh);
            }

            // Top base
            innerRadius = Math.abs( botEqPoints[last].x );
            outerRadius = Math.abs( topEqPoints[last].x );

            if ( innerRadius > outerRadius) {

                [ innerRadius, outerRadius ] = [ outerRadius, innerRadius ];

            }

            if ( innerRadius !== outerRadius) {
                geometry = new THREE.RingGeometry( innerRadius, outerRadius, 100, 8, 0, twoPi);
                mesh = new THREE.Mesh( geometry, material );
                mesh.position.set( 0, topEqPoints[last].y, 0 );
                mesh.rotation.set( halfPi, 0, 0 );
                solid.add(mesh);
            }

            // washer
            innerRadius = Math.abs( botEqPoints[last/2].x );
            outerRadius = Math.abs( topEqPoints[last/2].x );
            if ( innerRadius > outerRadius) {

                [ innerRadius, outerRadius ] = [ outerRadius, innerRadius ];

            }

            geometry = new THREE.RingGeometry( innerRadius, outerRadius, 100, 8, 0, twoPi);
            mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xFF0000, side: THREE.DoubleSide } ) );
            mesh.position.set( 0, topEqPoints[last/2].y, 0 );
            mesh.rotation.set( halfPi, 0, 0 );
            disk.add( mesh );

        }


    } else {

        // Shell method: Boundaries are parallel to rotate axis.

        var topEqPoints = getSolidPoints( topEquation, leftBound, rightBound, rotateAxis );
        var botEqPoints = getSolidPoints( botEquation, leftBound, rightBound, rotateAxis );

        var last = topEqPoints.length - 1;

        let innerRadius = Math.abs( leftBound.value - rotateAxis.value );
        let outerRadius = Math.abs( rightBound.value - rotateAxis.value );

        if ( innerRadius > outerRadius ) {
            [ innerRadius, outerRadius ] = [ outerRadius, innerRadius];
        }

        var innerHeight = Math.abs( topEqPoints[0].y - botEqPoints[0].y );
        var outerHeight = Math.abs( topEqPoints[last].y - botEqPoints[last].y );
        var innerMidPoint = ( topEqPoints[0].y + botEqPoints[0].y ) * 0.5;
        var outerMidPoint = ( topEqPoints[last].y + botEqPoints[last].y ) * 0.5;

        if ( rightBound.value <= rotateAxis.value ) {
            [ innerHeight, outerHeight ] = [ outerHeight, innerHeight ];
            [ innerMidPoint, outerMidPoint ] = [ outerMidPoint, innerMidPoint ];
        }

        if ( innerRadius !== 0 && innerHeight !== 0 ) {

            //inner side
            geometry = new THREE.CylinderGeometry( innerRadius, innerRadius, innerHeight, 64, 1, true );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, innerMidPoint, 0 );
            solid.add( mesh );
        }

        if ( outerRadius !== 0 && outerHeight !== 0 ) {

            //outer side
            geometry = new THREE.CylinderGeometry( outerRadius, outerRadius, outerHeight, 64, 1, true );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, outerMidPoint, 0 );
            solid.add( mesh );

        }

        //bottom base
        geometry = new THREE.LatheGeometry( botEqPoints, 100 );
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( 0, 0, 0 );
        solid.add( mesh );

        //top base
        geometry = new THREE.LatheGeometry( topEqPoints, 100 );
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( 0, 0, 0 );
        solid.add( mesh );

        //shell
        var mid = Math.ceil( last / 2 );
        let midRadius = Math.abs( topEqPoints[ mid ].x );
        // var midRadius = ( outerRadius + innerRadius ) * 0.5;
        var midHeight = Math.abs( topEqPoints[ mid ].y - botEqPoints[ mid ].y );
        var midMidPoint = ( topEqPoints[ mid ].y + botEqPoints[ mid ].y ) * 0.5;
        geometry = new THREE.CylinderGeometry( midRadius, midRadius, midHeight, 64, 1, true );
        mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xFF0000, side: THREE.DoubleSide } ) );
        mesh.position.set( 0, midMidPoint, 0 );
        disk.add( mesh );

    }

    if ( rotateAxis.type === equationType.EQUATION_Y) {

        solid.rotation.set( 0, 0, -halfPi );
        solid.position.y = rotateAxis.value;

        disk.rotation.set( 0, 0, -halfPi );
        disk.position.y = rotateAxis.value;

    } else {

        solid.position.x = rotateAxis.value;

        disk.position.x = rotateAxis.value;

    }


}

function getSolidPoints( equation, leftBound, rightBound, rotateAxis) {

    var points = [];

    if ( rotateAxis.type === equationType.EQUATION_Y) {

        if ( equation.type === equationType.EQUATION_X ) {

            for ( let i = 0; i <= 100; i++ ) {

                let y = leftBound.value + ( rightBound.value - leftBound.value ) / 100 * i;
                let scope = { y: y };
                let x = math.eval( equation.expr, scope );
                points.push( new THREE.Vector2( y - rotateAxis.value, x ) );


            }

        } else if ( equation.type === equationType.EQUATION_Y) {

            for ( let i = 0; i <= 100; i++ ) {

                let x = leftBound.value + ( rightBound.value - leftBound.value ) / 100 * i;
                let scope = { x: x };
                let y = math.eval( equation.expr, scope ) - rotateAxis.value;
                points.push( new THREE.Vector2( y, x ) );


            }

        }

    } else if ( rotateAxis.type == equationType.EQUATION_X) {

        if ( equation.type === equationType.EQUATION_Y ) {

            for ( let i = 0; i <= 100; i++ ) {

                let x = leftBound.value + ( rightBound.value - leftBound.value ) / 100 * i;
                let scope = { x: x };
                let y = math.eval( equation.expr, scope );
                points.push( new THREE.Vector2( x - rotateAxis.value, y ) );


            }


        } else if ( equation.type === equationType.EQUATION_X ) {

            for ( let i = 0; i <= 100; i++ ) {

                let y = leftBound.value + ( rightBound.value - leftBound.value ) / 100 * i;
                let scope = { y: y };
                let x = math.eval( equation.expr, scope ) - rotateAxis.value;
                points.push( new THREE.Vector2( x, y ) );

            }

        }

    }

    return points;

}

function animate() {
    requestAnimationFrame( animate );

    // solid.rotation.x += 0.1;
    // solid.rotation.y += 0.1;

    render();
}

function render() {

    renderer.render( scene, camera );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

