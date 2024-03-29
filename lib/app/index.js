var app = require('derby').createApp(module)
  .use(require('derby-ui-boot'))
  .use(require('../../ui'))


// ROUTES //

// Derby routes are rendered on the client and the server
app.get('/', function(page) {
  page.render('home');
});

app.get('/list', function(page, model, params, next) {
  // This value is set on the server in the `createUserId` middleware
  var userId = model.get('_session.userId');

  // Create a scoped model, which sets the base path for all model methods
  var user = model.at('users.' + userId);

  // Create a mongo query that gets the current user's items
  var itemsQuery = model.query('items', {userId: userId});

  // Get the inital data and subscribe to any updates
  model.subscribe(user, itemsQuery, function(err) {
    if (err) return next(err);

    // Create references that can be used in templates or controller methods
    model.ref('_page.user', user);
    itemsQuery.ref('_page.items');

    user.increment('visits');
    page.render('list');
  });
});


// CONTROLLER FUNCTIONS //

app.fn('list.add', function(e, el) {
  var newItem = this.model.del('_page.newItem');
  if (!newItem) return;
  newItem.userId = this.model.get('_session.userId');
  newItem.pos = {x:450, y:100};
  this.model.add('items', newItem);
});

app.fn('list.remove', function(e) {
  var id = e.get('.id');
  this.model.del('items.' + id);
});

app.fn('list.drag', function(e, el) {
  var id = e.get('.id');
  make_draggable(this.model, id, $(el));
});

function make_draggable(model, id, obj) {
    obj.draggable({
        stop:function(ev, ui) {
            var pos = ui.position;
            model.set('items.' + id + '.pos', {x:pos.left, y:pos.top});
        }
    });
}
