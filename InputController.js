
class InputController{

    clickedBody = new Body();

	constructor(){
		// bind input functions
		render.canvas.onmousedown = this.mouseDown;
    	render.canvas.onmousemove = this.mouseMove;
    	render.canvas.onmouseup =this. mouseUp;
	}


	mouseDown(event){
		const rect = render.canvas.getBoundingClientRect();
	    const x = event.clientX - rect.left;
	    const y = event.clientY - rect.top;

	    for (var i = 0; i < world.bodyArr.length; i++) {
	    	if (world.bodyArr[i].isInside(new Vector(x, y))) {
	    		this.clickedBody = world.bodyArr[i];
	    		
	    		this.clickedBody.queryOnly = true;

	   			//this.clickedBody.addForce(new Vector(10, -10));
	   			this.clickedBody.addTorque(1);


	    		break;
	    	}
	    }
 	}

 	mouseMove(event){
 		if (this.clickedBody) {
 			this.clickedBody.addPosition(new Vector(event.movementX, event.movementY));
 		}
 	}

 	mouseUp(event){
 		if (this.clickedBody) {
    		this.clickedBody.queryOnly = false;
 			this.clickedBody = null;	
 		}
 	}

 	



}
