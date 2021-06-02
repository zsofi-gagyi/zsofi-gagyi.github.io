let rowsInput, button, userMessage, colorPicker, patternText, radio, slider, rows;

///// setup /////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');

  this.setupInputZone();
}

function setupInputZone() {
    setupRowNumberInput();
    setupCurveSelection();
    setupColorSelection();
    setupPlaceholderPhoto();
}

function setupColorSelection() {
    userMessage3 = createElement('h3', 'Personalize your colors using these palettes:');
    userMessage3.position(20, 130);
    
    colorPicker1 = createColorPicker('#da8568');
    colorPicker1.position(20, 170);
    colorPicker1.input(createPattern);
    
    colorPicker2 = createColorPicker('#6e745d');
    colorPicker2.position(120, 170);
    colorPicker2.input(createPattern);
}

function setupRowNumberInput() {
    userMessage = createElement('h2', 'How many (even) rows should the gradient span?');
    userMessage.position(20, 5);
    
    rowsInput = createInput();
    rowsInput.position(20, 55);
    
    button = createButton('submit');
    button.position(rowsInput.x + rowsInput.width, 55);
    button.mousePressed(createPattern);
}

function setupCurveSelection() {
    userMessage2 = createElement('h3', 'Calculate gradient with: ');
    userMessage2.position(20, 70);
    
    radio = createRadio();
    radio.option(1, 'circle     ');
    radio.option(2, 'adjustable bezier curve');
    radio.style('data-type', 'horizontal');
    radio.position(20, 110);
    radio.changed(createPattern);
    select('input[type="radio"]:not(:checked)').attribute('checked', 'true');
}

function setupPlaceholderPhoto() {
    loadImage('knit.png', img => {
        image(img, windowHeight, 0, windowWidth - windowHeight, windowHeight)});
}

///// create /////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createPattern() {
    if (patternText !== undefined) {
        patternText.remove();
    }

    clear();

    rows = parseInt(rowsInput.value(), 10);

    if (isNaN(rows)) { 
        userMessage.html('How many rows should the gradient span? (in numbers)');
        rowsInput.value('');
        return; 
    }

    if (rows % 2 === 1){
        rows--;
        rowsInput.value(rows);
    }

    userMessage.html('Gradient pattern for ' + rows + ' rows:');

    let gradient;
    if (radio.value() === '1') {
        if (slider !== undefined) {
            slider.remove();
        }

        gradient = calculateCircularGradient(rows);
        renderCircle();
        renderCommonElements(gradient)
    }
    else {
        slider = createSlider(0, 1, 0.7, 0.01);
        slider.position(windowWidth / 3.8, windowHeight * 0.45);
        slider.style('width', windowHeight * 0.85 + 'px');
        slider.style('transform', 'rotate(90deg)');
        slider.input(renderBezier);

        renderBezier();
    }
}

function renderBezier() {
    if (patternText !== undefined) {
        patternText.remove();
    }

    clear();
    noStroke();
    gradient = calculateBezierGradient(rows);

    renderCommonElements(gradient)
}

function renderCommonElements(gradient) {
    renderPatternAsLine(gradient);
    renderPatternAsImage(gradient);
    renderPatternAsText(gradient);
}

///// calculate /////////////////////////////////////////////////////////////////////////////////////////////////////////////
function calculateCircularGradient(rows) { // with a line starting from the lower left corner
    let solution = ["up"];

    let radius = rows / 2;

    let position = {
        x: 0,
        y: radius - 1
    };

    while (position.y > 0){
        let nextRight = moveRightBy(position, 1);   

        if (stillInsideCircle(nextRight, radius)) {
            solution.push("right");
            position = nextRight;
        } else {
            position = moveUpBy(position, 1);   
            solution.push("up");
        }
    }

    solution.push("right");

    return solution;
}

function calculateBezierGradient(rows) {
    drawBezierCurve();

    const unit = windowHeight * 0.8 /((rows + 2)/ 2);
    let solution = ["up"];

    let position = {
        x: windowHeight * 0.1,
        y: windowHeight * 0.9 - unit
    };

    for(var i = 0; i < (rows / 2); i++){
        let nextRight = moveRightBy(position, unit);   

        if (stillInsideBezier(nextRight)) {
            position = nextRight;
            solution.push("right");
        } else {
            position = moveUpBy(position, unit);   
            solution.push("up");
        }
    }

    solution = addMirroredSolution(solution);
    return solution;
}

function drawBezierCurve() {
    var pointiness = slider.value() * windowHeight * 2/3 + windowHeight * 0.2;

    fill(color(239,239,239));
    beginShape();
    vertex(0,0);
    vertex(0, windowHeight * 0.9);
    vertex(windowHeight * 0.1, windowHeight * 0.9)
    bezierVertex(pointiness, windowHeight * 0.9, windowHeight * 0.9, pointiness, windowHeight * 0.9, windowHeight * 0.1);
    vertex(windowHeight * 0.9, 0);
    endShape();
}

function addMirroredSolution(solution) {
    var mirrorSolution = [];
    for (var i = 0; i < solution.length; i++) {
        if (solution[i] === 'up') {
            mirrorSolution.unshift('right');
        }
        else {
            mirrorSolution.unshift('up');
        }
    }

    return (solution.concat(mirrorSolution));
}

function moveRightBy(position, distance) {    
    return {
        x: position.x + distance,
        y: position.y
    };
}

function moveUpBy(position, distance) {    
    return {
        x: position.x,
        y: position.y - distance 
    };
}

function stillInsideCircle(position, r) {
    return radio.value() === '1'
        ? (position.x * position.x + position.y * position.y <= r * r)
        : false;
}

function stillInsideBezier(position) {
    return get(position.x, position.y)[0] === 239;
}

///// render /////////////////////////////////////////////////////////////////////////////////////////////////////////////
function renderPatternAsImage(gradient) {
    var gradientWithBookends = ["right", "right", "right"].concat(gradient, ["up", "up", "up"]);
    
    var unitHeight = windowHeight / gradientWithBookends.length;
    
    for (let i = 0; i < gradientWithBookends.length; i++) {
      let color = gradientWithBookends[i] === "right" ? colorPicker1.color() : colorPicker2.color();
      fill(color);
      stroke(color);
      rect(windowHeight, i * unitHeight, windowWidth - windowHeight, unitHeight);
    }
}

function renderCircle() {
    noStroke();
    fill(color(239,239,239));
    circle(windowHeight * 0.1, windowHeight * 0.1, windowHeight * 0.8 * 2);
    stroke(color(239,239,239));
}

function renderPatternAsLine(gradient) {
    const unit = windowHeight * 0.8 /(gradient.length / 2);
    const width = 9; // maybe make it proportional to length
    
    var position = {
        x: windowHeight * 0.1, 
        y: windowHeight * 0.9
    };
    
    drawStraightEnds(width, position);
    
    for (let i = 0; i < gradient.length; i++) {
        if (gradient[i] === "right" ){
            drawRightStroke(position, unit, width);
            position = moveRightBy(position, unit);   
        }
        else {
            drawUpStroke(position, unit, width);
            position = moveUpBy(position, unit);         
        }
    }
}

function drawStraightEnds(width, position) {
    stroke(color(239,239,239));
    fill(colorPicker2.color());
    rect(0, position.y - width, windowHeight * 0.1 + width, width * 2);

    fill(colorPicker1.color());
    rect(windowHeight * 0.9 - width, 0, width * 2, windowHeight * 0.1 + width);
}

function drawRightStroke(position, length, width) {
    fill(colorPicker2.color());
    quad(
        position.x - width, 
        position.y - width, 
        
        position.x + width,
        position.y + width,
        
        position.x + width + length,
        position.y + width,

        position.x - width + length, 
        position.y - width
        );
}

function drawUpStroke(position, length, width) {
    fill(colorPicker1.color());
    quad(
        position.x - width, 
        position.y - width, 
        
        position.x + width,
        position.y + width,
        
        position.x + width,
        position.y + width - length,

        position.x - width, 
        position.y - width - length
        );
}

function renderPatternAsText(gradient) {
    var pattern = generatePattern(gradient);
    renderPatternText(pattern);
}

function generatePattern(gradient) {
    let pattern = [];
    let previousLetter = 'A';
    let accumulated = 0;

    for (let i = 1; i < gradient.length; i++){
        accumulated++;
        let currentLetter = gradient[i] === "right" ? 'B' : 'A';

        if (currentLetter !== previousLetter) {
            pattern.push(accumulated > 1 ? currentLetter + ' x ' + accumulated : currentLetter);
            accumulated = 0;
        }

        previousLetter = currentLetter;
    }

    pattern.push('A');
    return pattern;
}

function renderPatternText(pattern) {
    patternText = createElement('p', '...AAAAA, ' + pattern.join(', ') + ', BBBBB...');
    patternText.position(36, windowHeight * 0.9 + 16);
    patternText.size(windowHeight - 40, windowHeight * 0.1 - 15);   
    patternText.style('margin', '0');
    patternText.style('overflow', 'auto');
}
