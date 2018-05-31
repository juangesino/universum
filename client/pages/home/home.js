Session.set('initialize', true);
Session.set('play', false);
Session.set('time', 0);
Session.set('gravity', -10);
Session.set('particles', []);
Session.set('timeMax', 10);
timeSpeed = 100;
fps = 0.1;
ground = 10;
xOffset = 0;
xRightLimit = ($(document).width() - 11) + xOffset;

Tracker.autorun(function(){

  if (Session.get('initialize')) {
    initializeParticles();
  }

  if (Session.get('play')) {
    console.log('Starting time..');
    let timerId = window.setInterval(function() {
      Session.set('time', Session.get('time') + fps)
      if (Session.get('time') <= Session.get('timeMax')) {
        updateParticles();
      } else {
        clearInterval(timerId);
        Session.set('initialize', false);
        Session.set('play', false);
        console.log('Simulation ended.');
        logParticles();
      }
    }, timeSpeed);
    Session.set('timerId', timerId);
  }

});

Template.home.helpers({
  particles: function () {
    return Session.get('particles');
  }
});

Template.home.events({
  'submit .js-add-particle': function (event) {
    event.preventDefault();
    let action = event.target.modalAction.value;
    let particleId = event.target.modalParticleId.value;
    let positionX = event.target.positionX.value;
    let positionY = event.target.positionY.value;
    let mass = event.target.mass.value;
    let velocityX = event.target.velocityX.value;
    let accelerationX = event.target.accelerationX.value;
    let velocityY = event.target.velocityY.value;
    let accelerationY = event.target.accelerationY.value;
    if (positionX && positionX != '' && positionY && positionY != '') {

      let newParticle = {
        id: Math.floor(Math.random() * 100000),
        positionX: positionX,
        positionY: positionY,
        mass: mass || 0,
        velocityX: velocityX || 0,
        accelerationX: accelerationX || 0,
        velocityY: velocityY || 0,
        accelerationY: accelerationY || 0,
        bottom: parseFloat(positionY) + ground,
        left: parseFloat(positionX) + xOffset,
      }

      let particles = Session.get('particles');
      if (action === 'new') {
        particles.push(newParticle);
        Session.set('particles', particles);
      } else if (action === 'edit') {
        index = particles.findIndex(function(x) { return x.id == particleId; });
        particles[index].positionX = positionX;
        particles[index].positionY = positionY;
        particles[index].bottom = parseFloat(positionY) + ground;
        particles[index].left = parseFloat(positionX) + xOffset;
        particles[index].mass = mass;
        particles[index].velocityX = velocityX;
        particles[index].accelerationX = accelerationX;
        particles[index].velocityY = velocityY;
        particles[index].accelerationY = accelerationY;
        Session.set('particles', particles);
      }

      initializeParticles();

      $('#new-particle-modal').modal('hide');
    } else {
      $('#new-particle-error').show();
    }
    return false;
  },
  'click .particle': function (event) {
    let particleId = this.id;
    let positionX = this.positionX;
    let positionY = this.positionY;
    let mass = this.mass;
    let velocityX = this.velocityX;
    let accelerationX = this.accelerationX;
    let velocityY = this.velocityY;
    let accelerationY = this.accelerationY;
    $('#modalAction').val('edit');
    $('#modalParticleId').val(particleId);

    $('#positionX').val(positionX);
    $('#positionY').val(positionY);
    $('#mass').val(mass);
    $('#velocityX').val(velocityX);
    $('#accelerationX').val(accelerationX);
    $('#velocityY').val(velocityY);
    $('#accelerationY').val(accelerationY);

    $('#modalDeleteBtn').show();

    $('#new-particle-modal').modal('show');
  },
  'click #modalDeleteBtn': function () {
    event.preventDefault();
    let particleId = $('#modalParticleId').val();
    particles = Session.get('particles');
    particles = _.filter(particles, function(x) { return x.id != particleId; });
    Session.set('particles', particles);
    initializeParticles();
    $('#new-particle-modal').modal('hide');
  }
});

function logParticles () {
  console.log('Logging particles\' positions.');
  let particles = $('.particle');
  _.each(particles, function (particleHtml, index) {
    let particle = $(particleHtml);
    let positionY = $(document).height() - 10 - ground - particle.position().top;
    let positionX = particle.position().left - xOffset;
    console.log('Particle #' + (index+1) + ': (' + positionX + ', ' + positionY + ')');
  });
};

function initializeParticles () {
  console.log('Initializing particles..');
  let particles = Session.get('particles');
  _.each(particles, function (particleObj) {
    let particle = $('#particle'+particleObj.id);
    let positionY = parseFloat(particle.attr('data-position-y'));
    let positionX = parseFloat(particle.attr('data-position-x'));
    particle.css('bottom', positionY + ground).css('left', positionX + xOffset);
  });
  console.log('Particles initialized.');
}

function updateParticles () {
  let particles = $('.particle');
  _.each(particles, function (particleHtml) {
    let particle = $(particleHtml);
    let positionY = parseFloat(particle.attr('data-position-y'));
    let positionX = parseFloat(particle.attr('data-position-x'));
    // Movement due to gravity.
    if (parseFloat(particle.attr('data-mass')) && parseFloat(particle.attr('data-mass')) > 0) {
      move(particle, 'vertical', Session.get('gravity'));
    }
    // Horizontal movement if there is initial velocity or acceleration.
    if (parseFloat(particle.attr('data-velocity-horizontal')) !== 0 || parseFloat(particle.attr('data-acceleration-horizontal')) !== 0) {
      let horizontalAcceleration = particle.attr('data-acceleration-horizontal') || 0;
      move(particle, 'horizontal', parseFloat(horizontalAcceleration))
    }
    // Vertical movement if there is initial velocity or acceleration.
    if (parseFloat(particle.attr('data-velocity-vertical')) !== 0 || parseFloat(particle.attr('data-acceleration-vertical')) !== 0) {
      let verticalAcceleration = particle.attr('data-acceleration-vertical') || 0;
      move(particle, 'vertical', parseFloat(verticalAcceleration))
    }
  });
};

function move(particleHtml, direction, acceleration) {
  let particle = $(particleHtml);
  let position;
  let initialVelocity = 0;

  // Get position.
  if (direction === 'vertical') {
    position = parseFloat(particle.attr('data-position-y'));
  } else if (direction === 'horizontal') {
    position = parseFloat(particle.attr('data-position-x'));
  } else {
    console.error('Non-valid direction passed to move function. Direction: ', direction);
  }

  // Get initial velocity.
  if (direction === 'vertical' && particle.attr('data-velocity-vertical')) {
    initialVelocity = parseFloat(particle.attr('data-velocity-vertical'));
  } else if (direction === 'horizontal' && particle.attr('data-velocity-horizontal')) {
    initialVelocity = parseFloat(particle.attr('data-velocity-horizontal'));
  }

  newPosition = position + ( initialVelocity * Session.get('time') ) + (0.5 * acceleration * Math.pow(Session.get('time'), 2) );

  if (direction === 'vertical') {
    if (newPosition <= ground) {
      particle.css('bottom', ground);
    } else {
      particle.css('bottom', newPosition + ground);
    }
  } else if (direction === 'horizontal') {
    if (newPosition >= xRightLimit) {
      particle.css('left', xRightLimit);
    } else {
      if (newPosition <= 0) {
        particle.css('left', xOffset);
      } else {
        particle.css('left', newPosition + xOffset);
      }
    }
  } else {
    console.error('Non-valid direction passed to move function. Direction: ', direction);
  }
}
