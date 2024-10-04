// game logic


class Contents{

	constructor(){
	}

	tick(deltaTime){
		this.checkRemove()
	}


	keyDown(event){

		if ( 65 > event.keyCode || 90 < event.keyCode)
			return;

		var startPosX = this.getKeyPos(event.key.toLowerCase());
		var startPosY = window.innerHeight;


		var newBody = this.getAlphabatObj(event.keyCode, new Vector(startPosX, startPosY));
		newBody.setImage(this.getAlphabatImage(event.keyCode));
		newBody.setCustomPoint(this.getAlphabatShape(event.keyCode));
		newBody.setImageOffset(this.getAlphabatOffset(event.keyCode));
		
		world.addBody(newBody);

		newBody.addForce(new Vector(random(-6, 6), random(-55, -30)));
		newBody.addTorque(random(-1, 1));
	}


	
	getAlphabatObj(keyCode, position){
		switch(keyCode){
			case 65 : return new Polygon(position, 3, 50);
			case 66 : return new Polygon(position, 3, 50);
			case 67 : return new Circle(position, 50);
			case 68 : return new Polygon(position, 3, 50);
			case 69 : return new Circle(position, 45);
			case 70 : return new Polygon(position, 3, 50);
			case 71 : return new Polygon(position, 50);
			case 72 : return new Polygon(position, 50);
			case 73 : return new Polygon(position, 3, 50);
			case 74 : return new Polygon(position, 3, 50);
			case 75 : return new Polygon(position, 3, 50);
			case 76 : return new Polygon(position, 3, 50);
			case 77 : return new Polygon(position, 3, 50);
			case 78 : return new Polygon(position, 3, 50);
			case 79 : return new Circle(position, 45);
			case 80 : return new Polygon(position, 3, 50);
			case 81 : return new Polygon(position, 3, 50);
			case 82 : return new Polygon(position, 3, 50);
			case 83 : return new Polygon(position, 3, 50);
			case 84 : return new Polygon(position, 3, 50);
			case 85 : return new Polygon(position, 3, 50);
			case 86 : return new Polygon(position, 3, 50);
			case 87 : return new Polygon(position, 3, 50);
			case 88 : return new Polygon(position, 3, 50);
			case 89 : return new Polygon(position, 3, 50);
			case 90 : return new Polygon(position, 3, 50);
		}
	}


	getAlphabatImage(keyCode){
		switch(keyCode){
			case 65 : return 'resources/a.png';
			case 66 : return 'resources/b.png';
			case 67 : return 'resources/c.png';
			case 68 : return 'resources/d.png';
			case 69 : return 'resources/e.png';
			case 70 : return 'resources/f.png';
			case 71 : return 'resources/g.png';
			case 72 : return 'resources/h.png';
			case 73 : return 'resources/i.png';
			case 74 : return 'resources/j.png';
			case 75 : return 'resources/k.png';
			case 76 : return 'resources/l.png';
			case 77 : return 'resources/m.png';
			case 78 : return 'resources/n.png';
			case 79 : return 'resources/o.png';
			case 80 : return 'resources/p.png';
			case 81 : return 'resources/q.png';
			case 82 : return 'resources/r.png';
			case 83 : return 'resources/s.png';
			case 84 : return 'resources/t.png';
			case 85 : return 'resources/u.png';
			case 86 : return 'resources/v.png';
			case 87 : return 'resources/w.png';
			case 88 : return 'resources/x.png';
			case 89 : return 'resources/y.png';
			case 90 : return 'resources/z.png';
		}
	}

	getAlphabatShape(keyCode){
		switch(keyCode){
			case 65 : return [new Vector(-39, 45), new Vector(35, 45), new Vector(30, -45), new Vector(-37, -45)];
			case 66 : return [new Vector(-45, -52), new Vector(-20, -52), new Vector(20, -20), new Vector(24, 47), new Vector(-45, 47)];
			case 67 : return [];
			case 68 : return [new Vector(20, -50), new Vector(40, -50), new Vector(40, 50), new Vector(-25, 50), new Vector(-25, -20)];
			case 69 : return [];
			case 70 : return [new Vector(-25, -50), new Vector(25, -50), new Vector(15, 50), new Vector(-15, 50)];
			case 71 : return [new Vector(-30, -50), new Vector(30, -50), new Vector(30, 50), new Vector(-30, 50)];
			case 72 : return [new Vector(-35, -55), new Vector(-20, -55), new Vector(30, -20), new Vector(30, 50), new Vector(-35, 50)];
			case 73 : return [new Vector(-10, -50), new Vector(10, -50), new Vector(10, 50), new Vector(-10, 50)];
			case 74 : return [new Vector(-15, -55), new Vector(15, -55), new Vector(15, 55), new Vector(-15, 55)];
			case 75 : return [new Vector(-42, -60), new Vector(-30, -60), new Vector(40, -30), new Vector(40, 60), new Vector(-42, 60)];
			case 76 : return [new Vector(-10, -50), new Vector(10, -50), new Vector(10, 50), new Vector(-10, 50)];
			case 77 : return [new Vector(-50, -38), new Vector(50, -38), new Vector(50, 38), new Vector(-50, 38)];
			case 78 : return [new Vector(-30, -38), new Vector(30, -38), new Vector(30, 38), new Vector(-30, 38)];
			case 79 : return [];
			case 80 : return [new Vector(-42, -55), new Vector(24, -55), new Vector(24, 0), new Vector(-20, 50), new Vector(-42, 50)];
			case 81 : return [new Vector(-42, -55), new Vector(24, -55), new Vector(24, 50), new Vector(0, 50), new Vector(-42, 0)];
			case 82 : return [new Vector(-40, -45), new Vector(20, -45), new Vector(20, -25), new Vector(-20, 45), new Vector(-40, 45)];
			case 83 : return [new Vector(-30, -45), new Vector(30, -45), new Vector(30, 45), new Vector(-30, 45)];
			case 84 : return [new Vector(-30, -53), new Vector(30, -53), new Vector(30, 53), new Vector(-30, 53)];
			case 85 : return [new Vector(-35, -45), new Vector(35, -45), new Vector(35, 45), new Vector(-35, 45)];
			case 86 : return [new Vector(-40, -45), new Vector(40, -45), new Vector(10, 45), new Vector(-10, 45)];
			case 87 : return [new Vector(-50, -38), new Vector(50, -38), new Vector(30, 38), new Vector(-30, 38)];
			case 88 : return [new Vector(-40, -45), new Vector(40, -45), new Vector(40, 45), new Vector(-40, 45)];
			case 89 : return [new Vector(-40, -50), new Vector(30, -50), new Vector(-10, 50), new Vector(-40, 50)];
			case 90 : return [new Vector(-35, -45), new Vector(35, -45), new Vector(35, 45), new Vector(-35, 45)];

		}
	}

	getAlphabatOffset(keyCode){ // Image offset
		switch(keyCode){
			case 65 : return new Vector(0, 0);
			case 66 : return new Vector(0, 10);
			case 67 : return new Vector(-10, 0);
			case 68 : return new Vector(-5, 0);
			case 69 : return new Vector(0, 0);
			case 70 : return new Vector(0, 0);
			case 71 : return new Vector(0, 0);
			case 72 : return new Vector(0, 10);
			case 73 : return new Vector(0, 0);
			case 74 : return new Vector(0, 0);
			case 75 : return new Vector(5, 15);
			case 76 : return new Vector(0, 0);
			case 77 : return new Vector(0, 0);
			case 78 : return new Vector(0, 0);
			case 79 : return new Vector(0, 0);
			case 80 : return new Vector(6, 2);
			case 81 : return new Vector(0, 0);
			case 82 : return new Vector(5, 10);
			case 83 : return new Vector(0, 0);
			case 84 : return new Vector(0, 0);
			case 85 : return new Vector(0, 0);
			case 86 : return new Vector(3, 0);
			case 87 : return new Vector(0, 0);
			case 88 : return new Vector(0, 0);
			case 89 : return new Vector(10, 0);
			case 90 : return new Vector(0, 0);
		}
	}

	paddingRight = 100;
	xPos = (window.innerWidth - this.paddingRight) * 0.1;
	keyGapMiddle = this.xPos * 0.3;
	keyGapBottom = this.xPos * 0.7;

	getKeyPos(key){
		if(key == 'q')	return this.xPos * 1;
		if(key == 'w')	return this.xPos * 2;
		if(key == 'e')	return this.xPos * 3;
		if(key == 'r')	return this.xPos * 4;
		if(key == 't')	return this.xPos * 5;
		if(key == 'y')	return this.xPos * 6;
		if(key == 'u')	return this.xPos * 7;
		if(key == 'i')	return this.xPos * 8;
		if(key == 'o')	return this.xPos * 9;
		if(key == 'p')	return this.xPos * 10;

		if(key == 'a')	return this.xPos * 1 + this.keyGapMiddle;
		if(key == 's')	return this.xPos * 2 + this.keyGapMiddle;
		if(key == 'd')	return this.xPos * 3 + this.keyGapMiddle;
		if(key == 'f')	return this.xPos * 4 + this.keyGapMiddle;
		if(key == 'g')	return this.xPos * 5 + this.keyGapMiddle;
		if(key == 'h')	return this.xPos * 6 + this.keyGapMiddle;
		if(key == 'j')	return this.xPos * 7 + this.keyGapMiddle;
		if(key == 'k')	return this.xPos * 8 + this.keyGapMiddle;
		if(key == 'l')	return this.xPos * 9 + this.keyGapMiddle;

		if(key == 'z')	return this.xPos * 1 + this.keyGapBottom;
		if(key == 'x')	return this.xPos * 2 + this.keyGapBottom;
		if(key == 'c')	return this.xPos * 3 + this.keyGapBottom;
		if(key == 'v')	return this.xPos * 4 + this.keyGapBottom;
		if(key == 'b')	return this.xPos * 5 + this.keyGapBottom;
		if(key == 'n')	return this.xPos * 6 + this.keyGapBottom;
		if(key == 'm')	return this.xPos * 7 + this.keyGapBottom;
	}


	checkRemove(){
		for (var i = 0; i < world.bodyArr.length; i++) {
			var body = world.bodyArr[i];

			if (window.innerHeight < body.position.y) {

				world.removeBody(body);
				break;
			}
		}
	}



}

