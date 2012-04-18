$(function() {
  var Todo = Backbone.Model.extend({
    defaults: {
      name: "",
      completed: false,
    },
    
    initialize: function() {
      if (!this.get('name')) {
        this.set('name', this.defaults.name)
      }
    },
    
    clear: function() {
      this.destroy();
    },
    
    toggle_done: function(){
      this.save({completed: !this.get('completed')});
    },
  });
  
  var TodoList = Backbone.Collection.extend({
    model: Todo,
    url: '/todos',
    
    completed: function() {
      return this.filter(function(todo) { 
        return todo.get('completed'); 
      });
    },
    
    incomplete: function() {
      return this.filter(function(todo) {
        return !todo.get('completed');
      });
    },
    
    comparator: function(todo) {
      return todo.get('id');
    }
  });
  
  var todos = new TodoList();
  
  var TodoView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#todo-template").html()),
    
    events: {
      'click .completed-check': 'toggle_done',
      'click .name-label': 'toggle_done'
    },
    
    initialize: function() {
      _.bindAll(this, 'render', 'remove');
      
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },
    
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
    toggle_done: function() {
      this.model.toggle_done();
      console.log(this.$('.completed-check'))
      this.$('.completed-check').checked = this.model.get('completed');
    }
  });
  
  var NewTodoView = Backbone.View.extend({
    // Attach to an existing element
    el: $("#create-todo"),
    input: $("#new-todo"),
    
    events: {
      'keypress #new-todo': 'create_on_enter'
    },
    
    initialize: function() {
      _.bindAll(this, 'render', 'create_on_enter');
    },
    
    render: function(){
      $.noop();
    },
    
    new_attributes: function() {
      return {
        name: this.input.val(),
        completed: false
      };
    },
    
    create_on_enter: function(e){
      if (e.keyCode === 13) {
        todos.create(this.new_attributes());
        this.input.val('');
      }
    }
  });
  
  var TodoListView = Backbone.View.extend({
    // Attach to an existing element
    el: $("#todo-list"),
    
    initialize: function() {
      _.bindAll(this, 'render', 'addOne', 'addAll');
      
      todos.bind('add', this.addOne);
      todos.bind('reset', this.addAll);
    },
    
    render: function() {
      $.noop();
    },
    
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      $(this.el).append(view.render().el);
    },
    
    addAll: function() {
      todos.each(this.addOne)
    }
  });
  
  var TodoStatsView = Backbone.View.extend({
    // Attach to an existing element
    el: $("#todo-information"),
    
    template: _.template($("#stats-template").html()),
    
    events: {
      'click #mark-all-done': 'toggle_all_done',
      'click #clear-completed': 'clear_completed'
    },
    
    initialize: function(){
      _.bindAll(this, 'render', 'toggle_all_done', 'clear_completed');
      
      todos.bind('all', this.render);
    },
    
    render: function(){
      $(this.el).html(this.template({
        remaining_count: todos.incomplete().length,
        has_remaining: (todos.completed().length > 0)
      }));
    },
    
    toggle_all_done: function(){
      todos.each(function(todo) {
        todo.save({completed: true}); 
      });
    },
    
    clear_completed: function(){
      todos.completed().forEach(function(todo) {
        todo.clear();
      });
    },
  });
  
  var create = new NewTodoView();
  var list = new TodoListView();
  var stats = new TodoStatsView();
  
  todos.bind('all', function(evName) {
    console.log(evName);
  });
  
  todos.fetch({success: function() {
    list.render();
    stats.render();
  }});
});