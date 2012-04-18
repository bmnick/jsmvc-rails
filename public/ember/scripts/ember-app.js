var App = Ember.Application.create({
  ready: function() {
    App.ToDoController.findAll();
  },
});

App.ToDo = Ember.Resource.extend({
  resourceUrl: '/todos',
  resourceName: 'todo',
  resourceProperties: ['name', 'completed', 'id'],
  
  completedChanged: function() {
    this.saveResource();
  }.observes('completed')
});

App.ToDoController = Ember.ResourceController.create({
  resourceType: App.ToDo,
  
  create_todo: function(name){
    var todo = App.ToDo.create({
      name: name,
      completed: false
    });
    
    todo.saveResource()
    this.pushObject(todo);
  },
  
  complete: function(){
    return $.grep(this.get('content'), function(elem) {
      return elem.get('completed');
    });
  }.property("@each.completed").cacheable(),
  
  incomplete: function(){
    return $.grep(this.get('content'), function(elem) {
      return !(elem.get('completed'));
    })
  }.property("@each.completed").cacheable(),
  
  clear_completed: function() {
    var self = this;
    
    $.each(this.get('complete'), function(index, elem) {
      elem.destroyResource();
      self.removeObject(elem);
    });
  },
  
  mark_all_done: function() {
    $.each(this.get('incomplete'), function(index, elem) {
      elem.set('completed', true);
    });
  }
});

App.CreateTodoView = Ember.TextField.extend({
  insertNewline: function() {
    var value = this.get('value');

    if (value) {
      App.ToDoController.create_todo(value);
      this.set('value', '');
    }
  }
});

App.StatsView = Ember.View.extend({
  remaining_count: function() {
    return App.ToDoController.get('incomplete').length;
  }.property('App.ToDoController.@each.completed'),
});
