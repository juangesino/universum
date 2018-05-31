Template.navbar.helpers({
  getPlayClass: function () {
    if (Session.get('play')) {
      return 'hidden';
    } else {
      return '';
    }
  },
  getPauseClass: function () {
    if (Session.get('play')) {
      return '';
    } else {
      return 'hidden';
    }
  },
  getTime: function () {
    let time = parseFloat(Session.get('time'));
    time = Math.round(time * 100) / 100;
    return time;
  },
  getGravity: function () {
    let gravity = parseFloat(Session.get('gravity'));
    gravity = Math.round(gravity * 100) / 100;
    return gravity;
  }
});

Template.navbar.events({
  'click #playButton': function (event) {
    event.preventDefault();
    Session.set('play', true);
  },
  'click #pauseButton': function (event) {
    event.preventDefault();
    let currentTimer = Session.get('timerId');
    clearInterval(currentTimer);
    Session.set('initialize', false);
    Session.set('play', false);
  },
  'click #backButton': function (event) {
    event.preventDefault();
    let currentTimer = Session.get('timerId');
    clearInterval(currentTimer);
    Session.set('time', 0);
    Session.set('initialize', true);
    Session.set('play', false);
  },
  'click #resetButton': function (event) {
    event.preventDefault();
    let currentTimer = Session.get('timerId');
    clearInterval(currentTimer);
    Session.set('time', 0);
    Session.set('initialize', true);
    Session.set('play', false);
    Session.set('play', true);
  },
  'click #newParticle': function (event) {
    event.preventDefault();
    $('#modalDeleteBtn').hide();
    $('#modalAction').val('new');
    $('#new-particle-modal').modal('show');
  }
});
