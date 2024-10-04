
class World{

	gravity = new Vector();
	airDensity = 0.98;		// Resist of velocity
	width = 0;
	height = 0;

	bodyArr = [];

	points = [];  	// world clamp vertices
	//edges = [];	// world is square
	
	// default window size
	constructor(gravity, width = window.innerWidth, height = window.innerHeight){
		this.gravity = scale(gravity, 3);
    	this.width = width;
    	this.height = height;

		canvas.width = width;
		canvas.height = height;
		//canvas.style = "border:1px solid #000000";

	//	this.makeWorldEdges();
	}

	addBody(body){
		this.bodyArr.push(body);
	}
	
	removeBody(body){
		removeFromArray(this.bodyArr, body);
	}

	makeWorldEdges(){
		// vertices
		var leftTop = new Vector(0, 0);
		var rightTop = new Vector(this.width, 0);
		var leftBottom = new Vector(0, this.height);
		var rightBottom = new Vector(this.width, this.height);

		this.points.push(leftTop);
		this.points.push(rightTop);
		this.points.push(rightBottom);
		this.points.push(leftBottom);

		//this.edges.push(new Edge(leftTop, rightTop)); 		// ceiling
		//this.edges.push(new Edge(leftTop, leftBottom));		// left side wall
		//this.edges.push(new Edge(rightTop, rightBottom));		// right side wall
		//this.edges.push(new Edge(leftBottom, rightBottom));	// ground

		// edge is thin
		// then use box
		
		var thikness = 100; // wall

		var topPints = [leftTop, rightTop, new Vector(rightTop.x, -thikness), new Vector(leftTop.x, -thikness)];
		var leftPoints = [leftTop, leftBottom, new Vector(-thikness, leftBottom.y), new Vector(-thikness, leftTop.y)];
		var rightPoints = [rightTop, rightBottom, new Vector(rightBottom.x + thikness, rightBottom.y), new Vector(rightTop.x + thikness, rightTop.y)];
		var bottomPoints = [leftBottom, rightBottom, new Vector(rightBottom.x, rightBottom.y + thikness), new Vector(leftBottom.x, leftBottom.y + thikness)];

		var topBox = new Polygon(topPints);
		var leftBox = new Polygon(leftPoints);
		var rightBox = new Polygon(rightPoints);
		var bottomBox = new Polygon(bottomPoints);

		topBox.queryOnly = true;
		leftBox.queryOnly = true;
		rightBox.queryOnly = true;
		bottomBox.queryOnly = true;

		topBox.name = "top wall";
		leftBox.name = "left wall";
		rightBox.name = "right wall";
		bottomBox.name = "bottom Wall";


		this.addBody(topBox);
		this.addBody(leftBox);
		this.addBody(rightBox);
		this.addBody(bottomBox);

	}
}