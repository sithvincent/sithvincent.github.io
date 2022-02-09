
// ------------------------------
// INTRODUCTORY ESSAY
// ------------------------------

//I have implemented all three extensions. For the platforms, they are able to move; for the enemies, they will tend to move towards the character (x-position wise) if the character comes near. For music, there are sound effects and a background music which loops and gets louder as things get more intense. A 'bonus' extension I added is 'hard & easy mode' for the game.

//The hardest part for me was to procedurally generate mountains, platforms etc. that can populate a game whose length I want to easily change at any time. If I did this wrong it may lead to graphical glitches (tree floating over canyon, platforms clipping over each other). I also wanted to prevent the draw function from being inundated with too much code. 

//The solution was a ‘super-object’ called the Manager. Using platforms as an example, I placed all the functions (collision detection, object rendering etc.) and the array of platform objects inside the platformManager. Then, whenever I need to create any number of platforms, I just need to call the 'create' method in platformManager and pass some arguments, then all the platforms will be generated procedurally. 

//Another hard part is creating code to ensure objects only render when the character is near so that the game won't lag on certain laptops.

//Just refresh if the game doesn't load well at the start. This game is heavy on assets and rendering. 

//And yes, hard mode is winnable.


// ------------------------------
// VARIABLE INITIALIZATION
// ------------------------------

// GAME MECHANICS VARIABLES
var gameChar;               // game character object
var floor_y;                // y coordinate of floor
var scrollPos;              // to enable scrolling
var gameChar_world_x;       // gameChar.x-scrollPos
var gameScore;              // current game score 
var gameLife;               // how many lives the character has left
var jumpHeight;             // how high the character jumps
var motivation;             // the 'motivation' mechanic on hard mode
var enemies;                // the enemy object array
var platformIndex;          // the platform which the character is currently on
var musicCounter;           // controls looping of background music
var gameLength=13;          // Freely change this value to set how long you play before you reach flagpole. EVERYTHING will scale with it.


// 'STATE' VARIABLES (TRUE & FALSE VALUES)
var isLeft;                 // if the 'left' keyboard button is depressed
var isRight;                // if the 'right' keyboard button is depressed
var overCanyon;             // is character above a canyon?
var isJumping;              // is character jumping from ground?
var isHighJumping;          // is character jumping from a platform?
var platformTop;            // is the character above a platform?
var musicStart;             // is background music starting?
var platformContactSound;   // is platform contact sound enabled?
var gameEnd;                // has the game ended (be it in a loss or win)?
var gameStart;              // has the user selected game mode?
var hardSetting;            // is the game played on hard mode?
var enemyContact;           // is the character in contact with an enemy?


// GRAPHICS AND MUSIC RELATED VARIABLES
var charModulo=50;          // modulo of frame rate, for character animation
var coinModulo=40;          // modulo of frame rate, for coin animation
var grassExtent;            // how much of the ground is grass and how much is soil
var FPS;                    // displays FPS values


// ASSET VARIABLES
var heartImage;             // the heart image at the upper left corner
var backgroundMusic;        // background music
var platformContact;        // the sound of landing on platform
var skullHit;               // the sound of hitting enemies


// ------------------------------
// PRELOAD FUNCTION
// ------------------------------
function preload()
{
    // PRELOAD AUDIO FILES
    soundFormats('mp3','wav'); 
    coinSound = loadSound('assets/coin.wav');                           //coin/collectable collection sound
    coinSound.setVolume(0.2);
    backgroundMusic=loadSound('assets/alexander-nakarada-wanderer.mp3') //BGM
    backgroundMusic.setVolume(0.2)
    platformContact=loadSound('assets/platformContact.wav')             //When character hits the platform
    platformContact.setVolume(0.2)
    skullHit=loadSound('assets/splat.wav')                              //When character hits an enemy
    skullHit.setVolume(0.3)
    
    // PRELOAD IMAGES
    heartImage=loadImage('assets/heart.png')                            //Character lives display
    gameFont=loadFont('assets/Rockwell.otf')                            //Classy-ish font
}



// ------------------------------
// SETUP FUNCTION 
// ------------------------------
function setup()
{	    
    // INITIALIZING CANVAS AND GAME MECHANIC VARIABLES' VALUES. 
    createCanvas(1024*1.25, 576*1.1);     //Canvas size optimized to a standard laptop screen
	floor_y = height * 4/5;
    textFont(gameFont);
    gameLife=4;
    motivation=1000;        //The 'motivation' mechanic, play the game to find out!
    gameScore=-1;
    jumpHeight=150;         //How tall the character can jump
    startGame();            //Game-initializing function.
    
    
    // SET CORE STATES OF THE GAME TO FALSE AT INITIALIZATION
    musicCounter=0;
    musicStart=false; 
    gameEnd=false;
    gameStart=false;
    hardSetting=false;
    
            
	// INITIALIZE SCENERY FEATURES
    // For each scenery feature, I have grouped all the methods related to it as well as the associated array of scenery objects under a powerful master object called the Manager. 
    
    cloudManager.create(gameLength*2,300);                 //create clouds, the arguments are total amount & spacing of clouds respectively   
    mountainManager.create(gameLength*3,100,200,200);      //create BACKground mountains, the arguments are amount, spacing, height and alpha 
    mountainManager.create(gameLength*2,200,400,255);      //create FOREground mountains, arguments explained above    
    canyonManager.create(gameLength*1.6,600);              //create canyons, arguments are amount of canyons and spacing 
    coinManager.create(gameLength*7,150, 300,floor_y-100); //create coins (collectables), arguments are amount and spacing of coins, as well                                                              as the upper and lower bound y-coordinates since they are randomly generated
    coinManager.create(gameLength*11,90,floor_y-50,floor_y-20);     //The ground will be populated with more coins
    treeManager.create(gameLength*5.6,180)                          //create trees, argument being amount and spacing of trees   
    platformManager.create(gameLength*3.2,300,125,2);               //create moving platforms 
    pebbleManager.create();                                         //create pebbles 
    snowManager.create();                                           //create snow    
        
    
    // ENEMY CONSTRUCTOR FUNCTION AND OBJECTS
    enemies=[];
    for(i=0;i<gameLength*2-1;i++)
        {
            enemies.push(new Enemy(i*500+400,floor_y-12,450))    //arguments are enemy's x and y position and movement range
        }            
}



// ------------------
// DRAW FUNCTION
// ------------------
function draw()
{   
    // RENDER SKY AND GROUND 
    backgroundManager();
        
       
    // RENDER MOUNTAIN AND CLOUDS
    // There are multiple 'translates' to give a 3D feeling to background. All 'xxx.draw' calls the render methods.
    push(); 
    translate(scrollPos*0.2,0);         // Translate for clouds, then draw clouds
    cloudManager.draw();
    pop();  
    push();
    translate(scrollPos*0.5,0)          // Translate for mountains, then draw mountains
    mountainManager.draw();    
    pop();
    
    
    // RENDER CANYON, SNOW, COIN, TREES AND FLAGS. TOGGLE FLAG AND CANYON MECHANICS
    push();                             
    translate(scrollPos,0);                          // Translate for main game mechanics
    treeManager.draw();
    pebbleManager.draw();           
    canyonManager.checkCanyons();                    //checks if character is over canyon
    canyonManager.draw();
    flagpoleManager.check()                          //checks if character has arrived at flagpole
    flagpoleManager.draw();    
    platformManager.draw();
    platformManager.checkContact(gameChar_world_x,gameChar.y);  //checks if character is in contact with platform
    platformManager.movement();                                 //method for moving platform
    coinManager.checkCoin();                                    //checks if coin has already been 'collected'
    coinManager.draw(coinManager.object);  
    snowManager.draw();
    
    
    // RENDERING ENEMIES. TOGGLE ENEMY MECHANICS.    
    for(i=0;i<enemies.length;i++)
    {
        enemies[i].draw();
        enemies[i].updatePosition();
        enemies[i].checkContact(gameChar_world_x,gameChar.y); 
    }        
    pop();
    
    
    // EXECUTE CORE GAME FUNCTIONS
    drawGameChar();  //Drawing game character  
    gameManager();   //All game mechanics managed here    
    musicManager();  //Play background music 
    if(gameStart==false)  
    {
        settingsManager();          //At the start of the game, allows user to select hard or easy mode
    }
    if(gameEnd==false&&gameStart)
    {
        movementMechanics();        // Governs all character motion. Only activated when game hasn't ended.
    }    
    if (gameStart&&hardSetting&&gameEnd==false)   
    {
        motivation-=2;              //The 'motivation' mechanic. Only activated on hard mode and when game hasn't ended.
    } 
    
    
    backgroundMusic.setVolume(0.2+0.85*(gameChar_world_x/flagpoleManager.x));   //music gets louder nearer to flagpole
   
}



// ------------------------------
// GAME INITIALIZATION FUNCTION
// ------------------------------

function startGame()
{   
    // POSITIONS GAME CHARACTER AT GAME START (OR IF THE CHARACTER FALLS INTO RAVINE/HITS THE ENEMY)
    if (gameChar==undefined)   // If the game has just started, sets an initial position 
    {
        gameChar = 
        {
            x:220,
            y:floor_y
            
        }
        scrollPos = 0;
    }
    else    // If the character falls into a ravine/gets killed by enemies, he respawns to the top of his current position
        {              
            gameChar.y=floor_y-300   
        }	

    
	// RESET ALL THE GAME 'STATE' VALUES AT GAME START/RESTART
	gameChar_world_x = gameChar.x - scrollPos;
	isLeft = false;
	isRight = false;
	overCanyon = false;
    enemyContact = false;
}



// --------------------------------------
// FUNCTION TO HANDLE CORE GAME MECHANICS
// --------------------------------------
function gameManager()
{
    // GAME STATUS DISPLAY (LIVES, GAME SCORE AND 'MOTIVATION')
    push();
    textSize(20); 
    fill(200);
    stroke(10);
    push()
    coinManager.draw(coinManager.displayCoin);   
    pop()
    text('x '+gameScore,80,105);
    for (i=0;i<gameLife;i++)                // Display how many lives left
    {
        image(heartImage,30+i*45,20,45,45)
    }
    if(hardSetting)                         // Displays current motivation if playing on hard mode
    {
        text("Your motivation is at: "+motivation,30,140)
    }
    if(frameCount%8==0)                     // Displays current FPS
    {
        FPS=round(frameRate());
    }
    text("FPS: "+FPS, width*0.92,height*0.08)
    pop();
    
    
    
    // MANAGE THE LIVES OF GAME CHAR AND WIN/LOSE CONDITIONS
    if(gameChar.y>height||enemyContact)    // When game character drops into ravine or touches the enemy, restart game.
        {
            startGame();
            gameLife-=1;
        }
    
    
    // ENDS THE GAME IN DEFEAT IF GAME LIFE OR MOTIVATION IS 0 
    if(gameLife<1||motivation<0)           // when game ends in defeat, displays defeat screen
        {
            // DISPLAY BOX
            noStroke();
            fill(70,35,10)
            rect(width/10,height/10,width*0.75,height*0.75,50)
            fill(70,35,10)
            rect(width/9,height/9,width*0.75,height*0.75,50)
            fill(139,69,19)
            rect(width/8,height/8,width*0.75,height*0.75,50)
            // TEXT IN DISPLAY BOX            
            fill(255)
            textSize(110);                        
            text("YOU HAVE LOST!",width*0.16,height*0.43);
            fill(70,35,10); 
            textSize(70);
            text("REFRESH to replay.",width*0.25,height*0.57);            
            if (motivation<0)
            {
                text("You've run out of motivation.", width*0.15,height*0.25)
                textSize(30)
                text("HINT: Collectables, which increase your current motivation, ", width*0.18, height*0.75)
                text("           are more numerous on the floor where enemies are.", width*0.18, height*0.80)
            }
            else
            {
                text("You have run out of lives.", width*0.2,height*0.25)
                textSize(30)
                text("HINT: While enemies close in on you rapidly when you are nearby,", width*0.14, height*0.75)
                text("           they will slow down greatly when they get very close to you.", width*0.14, height*0.80)
            }            
            fill(128,0,0)
            text('You have covered '+floor(gameChar_world_x/(flagpoleManager.x)*100)+'% of the way to flagpole.',width*0.25, height*0.67)
            gameEnd=true;
        }
    
    
    //ENDS THE GAME IN VICTORY IF FLAGPOLE IS REACHED
    if(flagpoleManager.isReached)       // when game ends in victory, displays victory screen
        {
            // DISPLAY BOX
            fill(0,0,255);
            noStroke();
            fill(70,35,10);
            rect(width/10,height/10,width*0.75,height*0.75,50);
            fill(70,35,10);
            rect(width/9,height/9,width*0.75,height*0.75,50);
            fill(139,69,19);
            rect(width/8,height/8,width*0.75,height*0.75,50);  
            // TEXT IN DISPLAY BOX
            fill(255);
            textSize(110);                        
            text("YOU HAVE WON!",width/6,height*0.35);
            fill(70,35,10); 
            textSize(70);
            text("Your score is "+gameScore, width*0.30,height*0.5);
            text("REFRESH to replay.",width*0.27,height*0.65);
            textSize(30);
            text("HINT:   Your score is greatly increased when playing on hard mode.", width*0.15, height*0.74);
            textSize(20);
            fill(255);
            text("Try changing the 'gameLength' value in the code for a longer game and better challenge.", width*0.2, height*0.80)
            gameEnd=true;
        }   
    
    
	// COORDINATE OF GAME CHAR IN MOVING PLANE
	gameChar_world_x = gameChar.x - scrollPos;  
    
}


function musicManager()
{
    // PLAY BACKGROUND MUSIC
    if (musicCounter==180)     // Once music counter hits 180, song starts 
        {            
            backgroundMusic.loop=true;
            backgroundMusic.play();            
        }    
    if (musicCounter>12240)    // when the music counter reaches this figure, we know the music has ended, music counter restarts (loop)  
        {
            musicCounter=0
        }
    if (musicStart==true)      // music counter keeps track of how long the music has been playing
        {
            musicCounter+=1;
        }
}


// ---------------------------
// CHARACTER CONTROL FUNCTIONS
// ---------------------------

function keyPressed()
{
	if(keyCode==37) {isLeft=true;}          // character moves left
    if(keyCode==39) {isRight=true;}         // character moves right
    if(keyCode==32 && (gameChar.y>=floor_y&&gameChar.y<floor_y+15||platformTop==true) )  // character jumps
    {
        isJumping=true;                 // when character is jumping from ground
        if(platformTop)
            {
                isHighJumping=true;     // when character is jumping from platform
            }
    }
}


function keyReleased()
{    
	if(keyCode==37)     {isLeft=false;}
    if(keyCode==39)     {isRight=false;}
}


function mouseReleased()
{
    if(gameStart==false)
    {
        if(mouseX>width/7&&mouseX<width/7+300&&mouseY>height*0.19&&mouseY<height*0.19+150) //If user selects EASY mode at start
        {
            gameStart=true;
        }
        else if (mouseX>width/7&&mouseX<width/7+300&&mouseY>height*0.54&&mouseY<height*0.54+150) //If user selects HARD mode at start
        {
            gameStart=true;
            hardSetting=true;
        }            
    }
}

function movementMechanics()
{      
    // JUMPING AND FALLING INTO CANYON MECHANICS
    if(isHighJumping&&gameChar.y>=platformManager.object[platformIndex].y-jumpHeight)   //when character is jumping from platforms
    {
        gameChar.y=gameChar.y-(gameChar.y-(platformManager.object[platformIndex].y-jumpHeight)+3)*0.1;   
    }
    else if(isJumping&&gameChar.y>=floor_y-jumpHeight)                      //when character is jumping from floor
    {
        gameChar.y=gameChar.y-(gameChar.y-(floor_y-jumpHeight)+3)*0.1;         
    }
    else if ((gameChar.y>=floor_y&&overCanyon==false)||platformTop==true)  // when character hits floor or platform
    {
        gameChar.y+=0;        // disables all falling 
        isJumping=false;
        if (platformTop)      // this is to prevent character from seemingly 'floating' on the platform sometimes
            {   
                gameChar.y=platformManager.object[platformIndex].y-1
                scrollPos-=platformManager.object[platformIndex].velocity
            }
    }
    else if (gameChar.y<floor_y)    //once at max height reached by jumping, disables jumping and starts falling
    {
        gameChar.y+=3;        
        platformContactSound=true;
        isJumping=false;               
        isHighJumping=false;
    }
    else                        //if plumetting
    {
        gameChar.y+=10;                
    }                                                              
    
    
    // LEFT-RIGHT MOVEMENT MECHANICS (DISABLED IF PLUMMETING INTO CANYON)
    if (gameChar.y>floor_y&&overCanyon==true)     
        {}
    else
    {
        if(isLeft)
        {
            if(gameChar.x > width * 0.2)
            {
                gameChar.x -= 5;
            }
            else
            {
                scrollPos += 5;
            }
        }

        if(isRight)
        {
            if(gameChar.x < width * 0.8)
            {
                gameChar.x  += 5;
            }
            else
            {
                scrollPos -= 5; 
            }
        }
    }   
}



// ----------------------
// GAME SETTINGS FUNCTION
// ---------------------- 

function settingsManager()
{
    // DRAW MENU SCREEN AND BUTTONS AT THE START
    noStroke();
    fill(70,35,10)
    rect(width/10,height/10,width*0.75,height*0.75,50)
    fill(70,35,10)
    rect(width/9,height/9,width*0.75,height*0.75,50)
    fill(139,69,19)
    rect(width/8,height/8,width*0.75,height*0.75,50)
    //Buttons to select hard or easy mode
    fill(255);
    rect(width/7,height*0.19,300,150,10)    //easy mode button
    fill(200);
    rect(width/7,height*0.54,300,150,10)     //hard mode button
    
    
    // TEXTS ON THE MENU SCREEN AND HARD MODE VS EASY MODE CHOICES
    push();
    fill(70,35,10); 
    textSize(80);    
    text("EASY",width*0.18,height*0.30);
    text("MODE",width/6,height*0.40);
    textSize(80);
    text("ANGEL",width*0.18,height*0.65);
    text("MODE",width/6,height*0.75);
    fill(70,35,10);
    textSize(25);
    text("Left click this for easier marking (if you're a tutor) and ",width*0.39,height*0.25);
    text("to get familiar with core game mechanics. Avoid  ",width*0.39,height*0.30);
    text("canyons and enemies to get to the flagpole at the end. ",width*0.39,height*0.35);
    text("You lose when your lives (hearts) are depleted.",width*0.39,height*0.40);
    text("On top of easy mode mechanics, there is a value ",width*0.39,height*0.55);
    text("called 'motivation' which constantly drops until you ",width*0.39,height*0.60);
    text("reach the flagpole. Collectables give a small boost to",width*0.39,height*0.65);
    text("motivation. Once motivation level hits 0, you lose.",width*0.39,height*0.70);
    text("There will be a 'battery' above the character ",width*0.39,height*0.75);
    text("indicating motivation level.",width*0.39,height*0.80);
    pop();
}



// ------------------------------
// GAME CHARACTER RENDER FUNCTION
// ------------------------------

function drawGameChar()
{                  
    // IF THE CHARACTER IS JUMPING TO THE LEFT
	if(isLeft && isJumping == true)
    {   
        push()
        strokeWeight (2) ;       
        stroke(175,115,115);
        fill(255,0,0); 
        line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-25);     //back arm
        push();
        noStroke();
        fill(200,150,150);
        ellipse(gameChar.x,gameChar.y-60,25 );  //head
        fill (255);
        ellipse(gameChar.x-5,gameChar.y-63,7);  //left eye   
        fill(0);
        ellipse(gameChar.x-6,gameChar.y-63,2);  //left iris
        fill(148, 0, 211);
        rect(gameChar.x-10,gameChar.y-45,20,30,5);                      //torso
        stroke(10);
        strokeWeight (1);
        line(gameChar.x-3,gameChar.y-55,gameChar.x-10,gameChar.y-55);   //mouth
        pop();                
        line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-38);     //front arm
        line(gameChar.x+5,gameChar.y-18,gameChar.x+9,gameChar.y);       //leg2
        line(gameChar.x-5,gameChar.y-18,gameChar.x-9,gameChar.y-10);    //leg 1 upper part
        line(gameChar.x-9,gameChar.y-10,gameChar.x-5,gameChar.y-5);     //leg 1 lower part
        strokeWeight (2)
        stroke (8,8,8,100);     // winds of movement
        line (gameChar.x+25,gameChar.y-48,gameChar.x+40,gameChar.y-33); 
        line (gameChar.x+25,gameChar.y-38,gameChar.x+40,gameChar.y-23);
        line (gameChar.x+25,gameChar.y-28,gameChar.x+40,gameChar.y-13);
        pop();
	}
	
    // IF THE CHARACTER IS JUMPING TO THE RIGHT
    else if(isRight && isJumping == true)
	{
		push()
        strokeWeight (2) ;       
        stroke(175,115,115);
        fill(255,0,0);
        line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-25);    // back arm
        push();
        noStroke();
        fill(200,150,150);
        ellipse(gameChar.x,gameChar.y-60,25 );              //head
        fill (255);
        ellipse(gameChar.x+5,gameChar.y-63,7);              //right eye
        fill(0);
        ellipse(gameChar.x+6,gameChar.y-63,2);              //right iris  
        fill(148, 0, 211);
        rect(gameChar.x-10,gameChar.y-45,20,30,5);          //torso 
        stroke(10);
        strokeWeight (1);
        line(gameChar.x+3,gameChar.y-55,gameChar.x+10,gameChar.y-55);   //mouth       
        pop();
        line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-38);     //front arm
        line(gameChar.x-5,gameChar.y-18,gameChar.x-9,gameChar.y);       //leg 1
        line(gameChar.x+5,gameChar.y-18,gameChar.x+9,gameChar.y-10);    //leg 2 upper part
        line(gameChar.x+9,gameChar.y-10,gameChar.x+5,gameChar.y-5);     //leg 2 lower part
        strokeWeight (2)
        stroke (8,8,8,100);     // winds of movement
        line (gameChar.x-25,gameChar.y-48,gameChar.x-40,gameChar.y-33); 
        line (gameChar.x-25,gameChar.y-38,gameChar.x-40,gameChar.y-23);
        line (gameChar.x-25,gameChar.y-28,gameChar.x-40,gameChar.y-13);
        pop();
	}    
    
    // IF THE CHARACTER IS WALKING TO THE LEFT
	else if(isLeft==true)
	{   
        //Back Arm Render + Movement
        push();
        strokeWeight (2) ;       
        stroke(175,115,115);
        if(frameCount%charModulo<charModulo/4)
        {line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-25);}
        else if (frameCount%charModulo>=charModulo/2&&frameCount%charModulo<charModulo*3/4) {line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-25)}
        else {line(gameChar.x,gameChar.y-38,gameChar.x,gameChar.y-25);} 
        // Head + Torso
        push()
        noStroke()
        fill(200,150,150);
        ellipse(gameChar.x,gameChar.y-60,25 );          //head
        fill (255);
        ellipse(gameChar.x-5,gameChar.y-63,6);          //left eye   
        fill(0);
        ellipse(gameChar.x-6,gameChar.y-63,2);          //left iris       
        fill(148, 0, 211);        
        rect(gameChar.x-9,gameChar.y-48,20,30,5);       //torso 
        stroke(10)
        strokeWeight (1)
        line(gameChar.x-3,gameChar.y-55,gameChar.x-10,gameChar.y-55); //mouth
        pop();
        // Front Arm
        if(frameCount%charModulo<charModulo/4)
        {line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-25);}
        else if (frameCount%charModulo>=charModulo/2&&frameCount%charModulo<charModulo*3/4) {line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-25)}
        else {line(gameChar.x,gameChar.y-38,gameChar.x,gameChar.y-25);} 
        //legs
        line(gameChar.x-2,gameChar.y-18,gameChar.x-8,gameChar.y);       //leg 1 
        line(gameChar.x+2,gameChar.y-18,gameChar.x+8,gameChar.y);       //leg 2
        pop()
	}  
    
    // IF THE CHARACTER IS WALKING TO THE RIGHT
    else if(isRight==true)
	{   
        // Back Arm Render + Movement
        push();
        strokeWeight (2) ;       
        stroke(175,115,115);
        if(frameCount%charModulo<charModulo/4)
        {line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-25);}
        else if (frameCount%charModulo>=charModulo/2&&frameCount%charModulo<charModulo*3/4) {line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-25)}
        else {line(gameChar.x,gameChar.y-38,gameChar.x,gameChar.y-25);}   
        // Head + Torso
        push()
        noStroke()
        fill(200,150,150);
        ellipse(gameChar.x-1,gameChar.y-60,23,25 );       
        fill (255);
        ellipse(gameChar.x+4,gameChar.y-63,6);                          //right eye
        fill(0);
        ellipse(gameChar.x+5,gameChar.y-63,2);                          //right iris                
        fill(148, 0, 211);        
        rect(gameChar.x-11,gameChar.y-48,18,30,5);                      //torso 
        stroke(10)
        strokeWeight (1)
        line(gameChar.x+2,gameChar.y-55,gameChar.x+9,gameChar.y-55);    //mouth
        pop()
        // Front Arm
        if(frameCount%charModulo<charModulo/4)
        {line(gameChar.x,gameChar.y-38,gameChar.x-15,gameChar.y-25);}
        else if (frameCount%charModulo>=charModulo/2&&frameCount%charModulo<charModulo*3/4) {line(gameChar.x,gameChar.y-38,gameChar.x+15,gameChar.y-25)}
        else {line(gameChar.x,gameChar.y-38,gameChar.x,gameChar.y-25);} 
        // Legs
        line(gameChar.x-2,gameChar.y-18,gameChar.x-8,gameChar.y);       //leg 1 
        line(gameChar.x+2,gameChar.y-18,gameChar.x+8,gameChar.y);       //leg 2
        pop()
	}
        
    //IF CHARACTER IS JUMPING UPWARDS
    else if (isJumping==true)
	{
		push()
        noStroke()
        fill(150,100,100);
        ellipse(gameChar.x-2,gameChar.y-60,22,25 ); //back of head
        fill(200,150,150);
        ellipse(gameChar.x,gameChar.y-60,22,25 );   //head
        fill(255)
        ellipse(gameChar.x-5,gameChar.y-63,7);      //left eye
        ellipse(gameChar.x+5,gameChar.y-63,7);      //right eye
        fill(0);
        ellipse(gameChar.x-5,gameChar.y-63,2);      //left iris
        ellipse(gameChar.x+5,gameChar.y-63,2);      //right iris
        line(gameChar.x-5,gameChar.y-55,gameChar.x+5,gameChar.y-55); //mouth       
        fill(75, 0, 130);
        rect(gameChar.x-11,gameChar.y-48,18,30,5);                      //back of torso
        fill(148, 0, 211);
        rect(gameChar.x-8,gameChar.y-48,18,30,5);                       //torso
        pop()
        line(gameChar.x-5,gameChar.y-55,gameChar.x+5,gameChar.y-55);    //mouth  
        push();
        strokeWeight (2) ;       
        stroke(175,115,115);
        line(gameChar.x-8,gameChar.y-18,gameChar.x-12,gameChar.y-10);   //leg 1 upper part
        line(gameChar.x-12,gameChar.y-10,gameChar.x-8,gameChar.y-5);    //leg 1 lower part
        line(gameChar.x+8,gameChar.y-18,gameChar.x+12,gameChar.y);      //leg 2
        line(gameChar.x-10,gameChar.y-38,gameChar.x-20,gameChar.y-53);  //right arm
        line(gameChar.x+10,gameChar.y-38,gameChar.x+20,gameChar.y-20);  //left arm 
        pop();
  
	}    
    
    // IF CHARACTER IS STANDING FACING FRONT AND DOING NOTHING
	else         
	{
        noStroke();
        fill(150,100,100);
        ellipse(gameChar.x-2,gameChar.y-61,22,25 ); //back of head
        fill(200,150,150);
        ellipse(gameChar.x,gameChar.y-61,22,25 );   //head 
        fill(255)
        ellipse(gameChar.x-4,gameChar.y-65,5);      //left eye
        ellipse(gameChar.x+4,gameChar.y-65,5);      //right eye
        fill(0);
        stroke(10);
        ellipse(gameChar.x-4,gameChar.y-65,1);      //left iris
        ellipse(gameChar.x+4,gameChar.y-65,1);      //right iris        
        stroke(80,60,60)
        line(gameChar.x-4,gameChar.y-57,gameChar.x+4,gameChar.y-57); //mouth          
        noStroke();
        fill( 75, 0, 130);
        rect(gameChar.x-11,gameChar.y-48,18,30,5);  //back of torso
        fill(148, 0, 211);
        rect(gameChar.x-8,gameChar.y-48,18,30,5);   //torso 
        push()
        strokeWeight (2)        
        stroke(175,115,115);
        line(gameChar.x-4,gameChar.y-18,gameChar.x-7,gameChar.y-1);         //leg 1 
        line(gameChar.x+4,gameChar.y-18,gameChar.x+7,gameChar.y-1);         //leg 2	 
        line(gameChar.x-10,gameChar.y-38,gameChar.x-14,gameChar.y-23);      //right arm
        line(gameChar.x+10,gameChar.y-38,gameChar.x+14,gameChar.y-23);      //left arm
        pop()        	
	}
    
    // 'MOTIVATION' BATTERY ABOVE CHARACTER HEAD, ONLY RENDERED ON HARD MODE
    if(hardSetting)
    {        
        noStroke()
        if(motivation>400)          // changes the colour of the battery depending on its level
        {
            fill(0,255,0,200)
        }
        else
        {
            fill(255,0,0,200)    
        }        
        rect(gameChar.x-5,gameChar.y-(80+20*(motivation/1000)),8,20*(motivation/1000))  //'liquid' level of battery
        push();
        stroke(50);
        strokeWeight(2);
        noFill();
        rect(gameChar.x-6,gameChar.y-100,10,20,5)                                       //battery outline
        pop();
    }
    
}



// ------------------------------
// ENEMY CONSTRUCTOR FUNCTION
// ------------------------------
function Enemy (x,y,range)
{
    this.x=x;                           // fixes the rough area where this enemy is active in
    this.y=y;                           // enemy y coordinate
    this.range=range;                   // range of enemy movement
    this.eyeColour=random(150,255)      // eye colour
    this.skullColour=random(40,100)     // skull colour
    this.currentX=x;                    // the actual x position of the enemy
    this.speed=1;                       // variable for enemy speed. '1' is just placeholder
    this.updatePosition = 
        function()
        {
            this.currentX+=this.speed;
            if(gameChar_world_x>this.x&&gameChar_world_x<this.x+this.range)   //If character is nearby, it will rapidly close in on character's x-Position
            {
                this.speed = (gameChar_world_x-this.currentX)/35;
            }
            else                                                              //If game character is faraway, then movement is random.
            {
                if(this.currentX>=this.x+this.range)
                {                    
                    this.speed = -1;
                }
                else if (this.currentX < this.x)
                {
                    this.speed = 1;
                } 
            }            
        }
    this.draw = 
        function()
        {
            push();
            noStroke();
            fill (20);
            ellipse(this.currentX-3,this.y-12,30);                      //two ellipses for enemy head shadow
            ellipse(this.currentX-3,this.y,20);
            fill(this.skullColour)
            ellipse(this.currentX,this.y-12,30);                        //two ellipses for enemy head
            ellipse(this.currentX,this.y,20);
            fill(this.eyeColour,0,0);
            ellipse(this.currentX-6,this.y-12,8);                       //left eye of Enemy
            ellipse(this.currentX+6,this.y-12,8);                       //right eye of Enemy           
            strokeWeight(1);
            stroke(255,0,0);
            line(this.currentX-3,this.y-3,this.currentX-3,this.y+3);    //3 strokes for enemy mouth
            line(this.currentX,this.y-3,this.currentX,this.y+3);
            line(this.currentX+3,this.y-3,this.currentX+3,this.y+3);
            pop();
        }
    this.checkContact=
        function(gc_x,gc_y)
        {               
            if(dist(this.currentX,this.y,gc_x,gc_y)<30)
            {
                skullHit.play();
                enemyContact=true;
            }            
        }
    
}



// ----------------------------------------------------------
// MANAGERS FOR SCENERY FEATURES, COIN, PLATFORM AND FLAGPOLE 
// ----------------------------------------------------------

// A MASTER OBJECT MANAGING MOUNTAIN METHODS AND RENDERING. ARRAY OF MOUNTAIN OBJECTS STORED HERE.
    mountainManager =  {
                object: [],   // The individual mountain objects are going to be constructed within this array                
                draw: // Mountain rendering, implemented as a method instead of a separate function
                    function ()
                    {
                        for (var i = 0; i < this.object.length; i++)
                        {                                   
                            //Actual mountain. Middle coordinates = anchor
                            noStroke()
                            fill(this.object[i].colour)                                  
                            triangle
                                (this.object[i].x-this.object[i].size,   this.object[i].y,
                                 this.object[i].x,                       this.object[i].y-this.object[i].size*2*.8,
                                 this.object[i].x+this.object[i].size,   this.object[i].y)

                            //Snowy part of the mountain 
                            fill(230,230,255,this.object[i].fogginess);
                            triangle                
                                (this.object[i].x-(this.object[i].size*this.object[i].snowyExtent),  
                                 this.object[i].y-(this.object[i].size*2*.8*(1-this.object[i].snowyExtent)),
                                 this.object[i].x,                                                   
                                 this.object[i].y-this.object[i].size*2*.8,
                                 this.object[i].x+(this.object[i].size*this.object[i].snowyExtent),  
                                 this.object[i].y-(this.object[i].size*2*.8*(1-this.object[i].snowyExtent)))        
                        }
                    },        
                create:       // Blueprint for procedural/factory generation of mountains, implemented as a method 
                    function (amount,averageSize,spacing,fogginess)
                    {
                    for (var i=-6; i<amount;i++)  
                        {
                            this.object.push
                            ({
                                x:random(i*spacing,i*spacing+50),
                                y:floor_y,
                                size:random(averageSize-40,averageSize+40),
                                colour:[random(85,95),random(85,95),random(85,95)],
                                snowyExtent:random(0.5,0.6),
                                fogginess:fogginess
                            })
                        }
                    }
                }

// A MASTER OBJECT MANAGING CANYON METHODS AND RENDERING. ARRAY OF CANYON OBJECTS STORED HERE.
    canyonManager =    {
                object: [{x:-1600,size:1500}], //initial object is the steep drop to the left at game start to organically prevent movement towards there   
                draw: //Canyon rendering, implemented as a method instead of a separate function
                    function ()
                    {                             
                        for (var i = 0; i < this.object.length; i++)
                        {
                            noStroke()    
                            fill(90,  90, 90)      
                            rect(this.object[i].x,floor_y-0.8,this.object[i].size,grassExtent+5,5);   // anchor point
                            beginShape()    // so the canyon appears curvy instead of just a rectangle
                            curveVertex(this.object[i].x,floor_y+grassExtent)
                            curveVertex(this.object[i].x+this.object[i].size,floor_y+grassExtent)      
                            curveVertex(this.object[i].x+this.object[i].size+30,floor_y+grassExtent+200)
                            curveVertex(this.object[i].x-30,floor_y+grassExtent+200)
                            curveVertex(this.object[i].x,floor_y+grassExtent)
                            curveVertex(this.object[i].x+this.object[i].size,floor_y+grassExtent)    
                            endShape()
                        }
                    },        
                checkCanyons: //Canyon rendering, implemented as a method instead of a separate function
                    function ()
                    {                             
                        for (var i = 0; i < this.object.length; i++)
                        {
                            if(gameChar_world_x>(this.object[i].x+3)&&gameChar_world_x<(this.object[i].x+this.object[i].size-3))
                            {
                                overCanyon=true;
                            }
                            else 
                            {
                                overCanyon=false;
                            }
                            if(overCanyon==true)
                            {
                                break
                            }
                        }
                    }, 
                create:      // Blueprint for procedural/factory generation of canyons, implemented as a method 
                    function (amount,spacing)
                    {
                    for (var i=1; i<amount;i++)  
                        {
                            this.object.push
                            ({
                                x:random(i*spacing,i*spacing+50),
                                size:60
                            })
                        }
                    }
                }

// A MASTER OBJECT MANAGING CLOUD METHODS AND RENDERING. ARRAY OF CLOUD OBJECTS STORED HERE.
    cloudManager =    {
                object: [],   // The individual cloud objects are going to be constructed within this array                
                draw: // Cloud rendering, implemented as a method instead of a separate function
                    function ()
                    {
                        for (var i = 0; i < this.object.length; i++)
                        {   
                            //Cloud's Shadow
                            noStroke()
                            fill (160)
                            ellipse(this.object[i].x-5, this.object[i].y+5, this.object[i].size);               //big central circle, anchor point
                            ellipse(this.object[i].x-55, this.object[i].y+5, this.object[i].size*5/8);          //big left circle
                            ellipse(this.object[i].x+45, this.object[i].y+5, this.object[i].size*5/8);          //big right circle
                            ellipse(this.object[i].x-35, this.object[i].y-5, this.object[i].size*5/8);          //top left extra garnish
                            ellipse(this.object[i].x+25, this.object[i].y-5, this.object[i].size*5/8);          //top right extra garnish
                            ellipse(this.object[i].x-35, this.object[i].y+15, this.object[i].size*5/8);         //bot left extra garnish
                            ellipse(this.object[i].x+25, this.object[i].y+15, this.object[i].size*5/8);         //bot right extra garnish
                            //Actual cloud
                            fill (220);
                            ellipse(this.object[i].x, this.object[i].y, this.object[i].size);                   //big central circle, anchor point
                            ellipse(this.object[i].x-50, this.object[i].y, this.object[i].size*5/8);            //big left circle
                            ellipse(this.object[i].x+50, this.object[i].y, this.object[i].size*5/8);            //big right circle
                            ellipse(this.object[i].x-30, this.object[i].y-10, this.object[i].size*5/8);         //top left extra garnish
                            ellipse(this.object[i].x+30, this.object[i].y-10, this.object[i].size*5/8);         //top right extra garnish
                            ellipse(this.object[i].x-30, this.object[i].y+10, this.object[i].size*5/8);         //bot left extra garnish
                            ellipse(this.object[i].x+30, this.object[i].y+10, this.object[i].size*5/8);         //bot right extra garnish
                        }
                    },        
                create:  // Blueprint for procedural/factory generation of clouds, implemented as a method 
                    function (amount,spacing)
                    {
                        for (var i=-6; i<amount;i++)  
                        {
                            this.object.push
                            ({
                                x:random(i*spacing,i*spacing+50),
                                y:random(100,300),
                                size:random(60,100),                                
                            })
                        }
                    }
                }

// A MASTER OBJECT MANAGING TREE METHODS AND RENDERING. ARRAY OF TREE OBJECTS STORED HERE.
    treeManager =    {
                object: [],     // The individual tree objects are going to be constructed within this array                
                draw:           // Tree rendering, implemented as a method instead of a separate function
                    function ()
                    {
                        for (var i = 0; i < this.object.length; i++)      
                        {                                                           
                            for (var j=0;j<canyonManager.object.length;j++)
                            {   
                            // Detects whether the tree position is over the canyon
                                if(this.object[i].x>=canyonManager.object[j].x-2&&this.object[i].x<=(canyonManager.object[j].x+canyonManager.object[j].size+2))
                                    {
                                        this.object[i].overCanyon=true;
                                        break;
                                    }
                            }
                            
                            // We only render the tree when 1) character is near to reduce lag, and 2) tree is not over canyon
                            if(this.object[i].overCanyon==true||abs(gameChar_world_x-this.object[i].x)>width)
                                {}                 
                                else
                                {   
                                    treePos_y=floor_y-this.object[i].height;
                                    noStroke()
                                    fill (60,  45,  18)                    
                                    rect(this.object[i].x-14,floor_y-130+50,20,79);  
                                    fill (80,  60,  25)                    
                                    rect(this.object[i].x-10,floor_y-130+50,20,79);                  //tree trunk
                                    stroke(100);
                                    //bottom most triangle, central point is x anchor
                                    fill(this.object[i].colourBottom);             
                                    triangle(this.object[i].x,treePos_y-50, this.object[i].x-50,treePos_y+50,   this.object[i].x+50,treePos_y+50);    
                                    //middle triangle
                                    fill(this.object[i].colourMiddle); 
                                    triangle(this.object[i].x,treePos_y-60, this.object[i].x-35,treePos_y,      this.object[i].x+35,treePos_y);
                                    //top triangle
                                    fill(this.object[i].colourTop);
                                    triangle(this.object[i].x,treePos_y-90, this.object[i].x-20,treePos_y-40,   this.object[i].x+20,treePos_y-40);    
                                    //snowy part of tree
                                    fill(255)                                    
                                    triangle(this.object[i].x,treePos_y-90, this.object[i].x-10,treePos_y-65,   this.object[i].x+10,treePos_y-65);       
                                }                            
                            }
                        },    
                create:  // Blueprint for procedural/factory generation of trees, implemented as a method 
                    function (amount,spacing)
                    {
                        for (var i=0; i<amount;i++)  
                        {
                            this.object.push
                            ({
                                x:random(i*spacing,i*spacing+100),
                                colourBottom :[random(25,35),random(70,100),random(25,35)],
                                colourMiddle :[random(30,50),random(105,135),random(30,50)],
                                colourTop    :[random(40,60),random(135,165),random(40,60)],
                                height: random(100,130),
                                overCanyon: false
                            })
                        }
                    }
                }

// A MASTER OBJECT MANAGING SNOW METHODS AND RENDERING. ARRAY OF SNOW OBJECTS STORED HERE.
    snowManager =    {
                    object: [],   // The individual snow objects are going to be constructed within this array                
                    draw: // Snow rendering, implemented as a method instead of a separate function
                        function ()
                        {
                            for (i=0;i<this.object.length;i++)
                            {   
                                // We only render the snow when character is near to reduce lag
                                if(abs(gameChar_world_x-this.object[i].x)<width)    
                                {
                                    stroke(255,255,255,130);
                                    strokeWeight(3);
                                    point(this.object[i].x,this.object[i].y);
                                    this.object[i].y+=random(0.1,0.4);
                                    if (this.object[i].y>height+10)
                                    {
                                        this.object[i].y=-10
                                    }
                                }                                
                            }
                        },  
                    create:  // Blueprint for procedural generation of snows, implemented as a method 
                        function ()
                        {
                            for (i=0;i<gameLength*71+65;i++)
                            {
                                this.object.push
                                ({
                                    x:i*14-600,
                                    y:random(0,height)
                                })
                            }
                        }
                    }

// A MASTER OBJECT MANAGING COIN METHODS AND RENDERING. ARRAY OF COIN OBJECTS STORED HERE.
    coinManager =    {
                object: [], // The individual coin objects are going to be constructed here.
                displayCoin: [{x:50,y:95,size:30,isFound:false}],    //This is for the coin in the top left display.
                draw:           // Coin rendering, implemented as a method instead of a separate function
                    function (coins)
                    {
                        for (var i = 0; i < coins.length; i++)
                        {   
                            stroke (10);     
                            // Coins only rendered if it is not found yet and if it is near the character to reduce lag
                            if(coins[i].isFound==false&&abs(gameChar_world_x-this.object[i].x)<width||coins[i].size==30)
                            {
                                if(frameCount%coinModulo<coinModulo/4)            //coin facing left
                                 {  
                                    fill('goldenrod')
                                    ellipse(coins[i].x , coins[i].y, coins[i].size, coins[i].size + 10)       
                                    fill('gold')
                                    ellipse(coins[i].x - 3, coins[i].y, coins[i].size, coins[i].size + 10)
                                    stroke('Orange')
                                    ellipse(coins[i].x - 3, coins[i].y, coins[i].size - 5, coins[i].size + 5)
                                 }
                                else if(frameCount%coinModulo>coinModulo/2&&frameCount%coinModulo<coinModulo*3/4)    //coin facing right
                                {   
                                    fill('goldenrod')
                                    ellipse(coins[i].x -3, coins[i].y, coins[i].size, coins[i].size + 10)
                                    fill('gold')
                                    ellipse(coins[i].x , coins[i].y, coins[i].size, coins[i].size + 10)
                                    stroke('Orange')
                                    ellipse(coins[i].x , coins[i].y, coins[i].size - 5, coins[i].size + 5)
                                }
                                else                     //coin facing front
                                {   
                                    fill('gold')
                                    ellipse(coins[i].x , coins[i].y, coins[i].size+ 10, coins[i].size + 10)
                                    stroke('Orange')
                                    ellipse(coins[i].x , coins[i].y, coins[i].size + 5, coins[i].size + 5)
                                }
                            }
                            else
                            {
                            }
                        }
                    },        
                checkCoin:
                    function ()
                    {
                        for (var i = 0; i < this.object.length; i++)
                        {
                            if (abs(gameChar_world_x-this.object[i].x)<width) //code only activates if character is near
                            {
                                if (dist(gameChar_world_x,gameChar.y-35,this.object[i].x,this.object[i].y)<40)
                                {                                
                                    if(this.object[i].isFound==false)
                                    {
                                        this.object[i].isFound=true;
                                        coinSound.play();
                                        if(hardSetting)         // you get a higher score on higher settings
                                        {
                                            gameScore+=3;
                                        }
                                        else
                                        {
                                            gameScore+=1;
                                        }                                    
                                        motivation+=45;
                                        musicStart=true;    //Background music only starts when you collect first coin.
                                    }                            
                                }  
                            }
                            
                        }                        
                    },
                create:  // Coins will be generated in the vertical space between yPosUpper and yPosLower 
                    function (amount, spacing, yPosUpper, yPosLower)
                    {
                        for (var i=0; i<amount;i++)  
                        {
                            this.object.push
                            ({
                                x:random(i*spacing,i*spacing+25),
                                y:random(yPosUpper,yPosLower),
//                                y:random(400,floor_y-20),
                                size:15,
                                isFound:false
                            })
                        }
                    }
                }


// A MASTER OBJECT MANAGING PLATFORM METHODS AND RENDERING. ARRAY OF PLATFORM OBJECTS STORED HERE.
    platformManager =    {
                object: [],   // The individual platform objects are going to be constructed here.
                draw: // Platforms rendering, implemented as a method instead of a separate function//                    
                    function ()
                    {
                        for (var i = 0; i < this.object.length; i++)
                        {
                            if (abs(gameChar_world_x-this.object[i].x)<width) //platform only renders when character is near
                            {
                                noStroke()
                                fill ('SaddleBrown')
                                rect(this.object[i].x-1, this.object[i].y-1, this.object[i].length, 20,5);
                                rect(this.object[i].x-2, this.object[i].y-2, this.object[i].length, 20,5);
                                rect(this.object[i].x-3, this.object[i].y-3, this.object[i].length, 20,5);
                                rect(this.object[i].x-4, this.object[i].y-4, this.object[i].length, 20,5);
                                rect(this.object[i].x-5, this.object[i].y-5, this.object[i].length, 20,5);
                                fill ('Chocolate')
                                rect(this.object[i].x, this.object[i].y, this.object[i].length, 20,5);
                                for(j=0;j<6;j++)
                                {
                                    stroke(120,  42,  42);
                                    line(this.object[i].x+j*(this.object[i].length)/6, this.object[i].y, this.object[i].x+j*(this.object[i].length)/6,   this.object[i].y+18);
                                    line(this.object[i].x+j*(this.object[i].length)/6, this.object[i].y, this.object[i].x+j*(this.object[i].length)/6-5, this.object[i].y-3.5);
                                }
                            }                            
                        }
                    },        
                checkContact:                     
                  function(gc_x,gc_y,platform)
                    {                
                        for (var i = 0; i < this.object.length; i++)
                        {
                            platformTop=false
                            if (gc_x>(this.object[i].x-4)&&gc_x<(this.object[i].x+this.object[i].length+4))     //if character x position is within the platform
                            {
                                var d=this.object[i].y-gc_y
                                if(d>=-1&&d<3)            //if character y position is right above platform
                                    {
                                        platformIndex=i;
                                        platformTop=true;               //tells the game that the character is above the platform
                                        if(platformTop&&platformContactSound)  //plays the sound of contact with platform
                                            {                        
                                                platformContact.play();
                                                platformContactSound=false;
                                            }
                                        break;                              
                                    }
                                else
                                    {}
                            }
                        }
                        
                    },   
                movement:       // controls the back and forth movement of individual platforms
                    function()
                    {
                        for (i=0;i<this.object.length;i++)
                        {
                            if (abs(gameChar_world_x-this.object[i].x)<width)  // this function only activates when character is near
                            {
                                this.object[i].x+=this.object[i].velocity
                                if(abs(this.object[i].x-this.object[i].initialX)>100) 
                                {
                                    this.object[i].velocity*=-1;  // this code causes platform to oscillate back and forth
                                }
                            }
                            
                        }
                    }, 
                create:  // Blueprint for procedural, 'factory' generation of platforms, implemented as a method 
                    function (amount,spacing,averagelength,speed)
                    {
                        for (i=0;i<amount;i++)
                        {
                            this.object.push
                            ({
                                initialX:i*spacing,
                                x:i*spacing,
                                y:random(300,floor_y-50),
                                length:averagelength,
                                velocity:random([-1,1])*speed//                               
                            })
                        
                        }                
                    }
                }


// A MASTER OBJECT MANAGING FLAGPOLE METHODS AND RENDERING. THE FLAGPOLE OBJECT IS STORED HERE.
    flagpoleManager =    {
                    x:gameLength*1000,
                    isReached:false,                   
                    draw: // Flag rendering, implemented as a method instead of a separate function
                        function ()
                        {
                            push();
                            stroke(100);
                            strokeWeight(5);
                            line(this.x,floor_y,this.x,floor_y-200);
                            noStroke()
                            if (this.isReached)
                                {   
                                    fill (255)
                                    rect (this.x,floor_y-200, 50,30)
                                }
                            else
                                {   fill (255,0,0)
                                    rect (this.x,floor_y-200, 50,30)
                                }

                            pop();
                        },  
                    check:  // Checks if flagpole has been reached 
                        function ()
                        {
                            if(this.isReached==true)
                            {}
                            else
                            {
                                if(abs(gameChar_world_x-this.x)<10)
                                {
                                    this.isReached=true;
                                }
                            }
                            
                        }
                    }                

// A MASTER OBJECT MANAGING PEBBLE METHODS AND RENDERING. ARRAY OF PEBBLE OBJECTS STORED HERE.  
    pebbleManager =    {
                    object: [],     // The individual pebble objects are going to be constructed within this array                
                    draw:           // Pebble rendering, implemented as a method instead of a separate function
                        function ()
                        {                            
                            for (i=0;i<this.object.length;i++)      
                            {
                                if(abs(gameChar_world_x-this.object[i].x)<width)  //render pebbles only if character is near to prevent lag
                                {
                                    fill(200,200,150)
                                    ellipse(this.object[i].x,this.object[i].y+15,this.object[i].size_x,this.object[i].size_y)
                                }
                                
                            }                            
                        },  
                    create:         // Blueprint for procedural generation of pebbles, implemented as a method 
                        function ()
                        {
                            for (i=0;i<gameLength*26;i++)      //Creating 'pebbles' for the bottom soil
                            {
                                fill(255)
                                this.object.push
                                ({
                                  x:i*40,
                                  y:random(floor_y+height/12+15,height-15),
                                  size_x:random(10,15),
                                  size_y:random(5,10)})
                            } 
                        }
                    } 

// FUNCTION TO RENDER BACKGROUND
function backgroundManager ()
{
    background(15,  15, 75);                // fill the sky
    stroke(100);
    fill(120,  65,  14)                    
    rect(0, floor_y, width, height/4);      // draw bottom-most soil
    fill(107, 142,  35);                   
    grassExtent=height/9;
    rect(0, floor_y, width, grassExtent);   //draw the middle soil
    fill(0,120,20);
    rect(0, floor_y, width, grassExtent/2); // draw the grass
    fill(235,255,235);                              
    rect(0, floor_y, width, height/100);    // draw some frost 
}
