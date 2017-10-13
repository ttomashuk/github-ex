
$(function(){

  var RepoCollection = Backbone.Collection.extend({
  	url: 'https://api.github.com/search/repositories',

    parse: function (response) {
			var repositories = response.items;

			for (var i = 0, length = repositories.length; i < length; i++) {
				var currentRepo = repositories[i];
				var repoObject = {
          id: currentRepo.id,
          full_name: currentRepo.full_name,
          html_url: currentRepo.html_url
        };
				this.push(repoObject);
			}

			return this.models;
		},

  	initialize: function () {

  	},

    fetch: function(options) {
      var defaultParams = {
        q:"",
        order:"desc",
        page:1,
        per_page:10
      };

      _.mapObject(options, (v,k)=>defaultParams[k] = v);
      return Backbone.Collection.prototype.fetch.call(this, { data: $.param(defaultParams) });
    }
  });

  var repoCollection = new RepoCollection;


  var RepoView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#repo-template').html()),

    events: {
    },

    initialize: function() {
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });


  var AppView = Backbone.View.extend({
    el: $("#github-ex-app"),

    events: {
      'change #subject-select' : 'onSubjectChanged',
      'click input[name="sort-by"]': 'onSortByChanged',
      'submit' : 'onSearch'
    },
    initialize: function() {
      this.repoInput = this.$("#repo-input");
      this.sortByRadio = this.$('input:radio[name=sort-by]');
      this.sortByRadio.filter('[value=default]').prop('checked', true);
      this.listenTo(repoCollection, 'reset', this.showResults);
      this.listenTo(repoCollection, 'add', this.showRepo);

      this.searchParams = {
        q:'',
        sort:''
      };

      if(localStorage.searchParams) {
        this.searchParams = JSON.parse(localStorage.searchParams);
        this.repoInput.val(this.searchParams.q);
        if(this.searchParams.sort) {
          this.sortByRadio.filter('[value='+this.searchParams.sort+']').prop('checked', true);
        }
        this.onSearch();
      }
    },

    showRepo: function(repo) {
      var view = new RepoView({model: repo});
      this.$("#repo-list").append(view.render().el);
    },

    showResults: function() {
      repoCollection.each(this.showRepo, this);
    },

    onSortByChanged: function(event) {
      this.searchParams.sort = event.target.value;
      if(event.target.value == 'default') {
        delete this.searchParams.sort;
      }
    },

    onSearch: function(){
      this.searchParams.q = this.repoInput.val();
      localStorage.searchParams = JSON.stringify(this.searchParams);
      this.$("#repo-list").empty();
      repoCollection.fetch(this.searchParams);
      return false;
    }


 });

 var App = new AppView;
});
