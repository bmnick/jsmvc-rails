// Basic ajax setup to always get back json
$.ajaxSetup({
  headers: {Accept: 'application/json'},
});

/* Binding helper for executing an action after a new line
 */
ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                allBindings.executeOnEnter.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

/* Model for an individual todo - fairly boring.
 */
function Todo(name, completed, id) {
  var self = this;
  
  // setup default values
  name = name || "";
  completed = completed || false;
  id = id || -1;
  
  // Mutable data
  self.name = ko.observable(name);
  self.completed = ko.observable(completed);
  self.id = ko.observable(id);
  
  // computed data
  self.string_id = ko.computed(function() {
    return "todo_" + self.name;
  });
  self.transfer_object = ko.computed(function() {
    return {
      name: self.name(),
      completed: self.completed()
    };
  });
  
  // operations
  // DATA LOADING:
  self.save = function() {
    var method, url;
    if (self.id() === -1) {
      method = 'POST';
      url = '/todos'
    } else {
      method = 'PUT';
      url = '/todos/' + self.id();
    }
    
    $.ajax({
      type: method,
      url: url,
      data: {todo: self.transfer_object()},
      dataType: 'json',
      success: function(json) {
        if (json && json.id)
          self.id(json.id);
      }
    });
  };
  
  self.destroy = function() {
    $.ajax({
      type: 'DELETE',
      url: '/todos/' + self.id()
    });
  };
  
  self.completed.subscribe(self.save);
}

/* Overall View Model
 *
 * Contains Data being displayed by the view
 */
function TodoViewModel() {
  var self = this;
  
  // Mutable Data
  self.new_todo_name = ko.observable();
  self.todos = ko.observableArray([]);

  // Computed data
  self.completed_todos = ko.computed(function() {
    return self.todos().filter(function(elem) {
      return elem.completed();
    });
  });
  self.incomplete_todos = ko.computed(function() {
    return self.todos().filter(function(elem) {
      return !(elem.completed());
    });
  });
  self.remaining_todos = ko.computed(function() {
    return self.incomplete_todos().length;
  });
  self.has_completed = ko.computed(function() {
    var count = self.completed_todos().length;
        
    return count > 0;
  });
  
  // Operations
  self.add_todo = function() {
    // Create the todo
    var todo = new Todo(self.new_todo_name());
    
    // Save the todo
    self.todos.push(todo);
    // DATA LOADING:
    todo.save();
    
    // Reset some data...
    self.new_todo_name("");
  };
  self.mark_all_complete = function() {
    self.todos().forEach(function(elem) {
      elem.completed(true);
    });
  };
  self.clear_completed = function() {
    self.completed_todos().forEach(function(elem) {
      var to_remove = self.todos.remove(elem)[0];
      to_remove.destroy();
    })
  };
  
  // DATA LOADING:
  $.ajax({
    url: '/todos',
    success: function(json) {
      json.forEach(function(task) {
        self.todos.push(new Todo(task.name, task.completed, task.id));
      });
    }
  });
}

window.vm = new TodoViewModel();

ko.applyBindings(vm);