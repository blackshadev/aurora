(function (aur) {
	
	function lights(refrFn, errFn) {
		this.refrFn = refrFn;
		this.errFn = errFn;

		this.autoSync = false;//true;
		this.syncTime = 2000;
		this.th = null;

		this.refresh();
	}
	lights.prototype.setState = function(id, state) {
		var self = this;
		var pars = { 
			url: "/api/lights/" + id + "/state", 
			type: "PUT",
			success: function(data) {
				self.refresh();
			}
		};
		pars.data = {state: state};
		aur.apiCall(pars);
	};
	lights.prototype.setColor = function(id, color, mode) {
		var self = this;
		
		var pars = { 
			url: "/api/lights/" + id + "/color", 
			dataType: "json", 
			type: "PUT",
			success: function(data) {
				self.refresh();
			}
		};
		pars.data = {color: color, mode: mode};

		aur.apiCall(pars);
	};
	lights.prototype.setName = function(id, name) {
		var self = this;

		var pars = {
			url: "/api/lights/" + id + "/name",
			dataType: "json",
			type: "PUT",
			success: function(data) {
				self.refresh();
			}
		};
		pars.data = {name:name};

		aur.apiCall(pars);
	};
	lights.prototype.refresh = function() {
		var self = this;

		if(this.th) {
			window.clearTimeout(this.th);
			this.th = null;
		}

		var pars = {
			url: "/api/lights",
			type: "POST",
			success: function(data) {
				if(self.autoSync)
					self.th = window.setTimeout(
						function() { self.refresh(); }, 
						self.syncTime);

				self.refrFn(data);
			}
		};

		aur.apiCall(pars);
	};

	aur.Lights = lights;



})(aur);
