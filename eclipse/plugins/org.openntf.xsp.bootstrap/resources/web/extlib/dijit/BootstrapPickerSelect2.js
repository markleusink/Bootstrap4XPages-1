"use strict";

dojo.provide("extlib.dijit.BootstrapPickerSelect2");

dojo.require("dijit._WidgetBase");
dojo.require("dojo.io.script");
dojo.require("dojo.NodeList-manipulate");

//TODO: pagination in the list of options (e.g. view has more items than shown by default...)

dojo.declare(
	'extlib.dijit.BootstrapPickerSelect2',
	dijit._WidgetBase,
	{
		
		constructor: function(args) {
	        dojo.safeMixin(this,args);
			
			var head = dojo.query("head");
			head.append("<link rel=\"stylesheet\" type=\"text/css\" href=\"/xsp/.ibmxspres/.extlib/bootstrap/select2/select2.css\">");
			head.append("<link rel=\"stylesheet\" type=\"text/css\" href=\"/xsp/.ibmxspres/.extlib/bootstrap/select2/select2-bootstrap.css\">");
			
			var deferred = dojo.io.script.get({url : "/xsp/.ibmxspres/.extlib/bootstrap/select2/select2.min.js"});
	       
			deferred.then( dojo.hitch( this, function() {
				
				//code executed after the script lib has loaded
				this.createSelect2();

			} ));

	    },
	    
	    createSelect2 : function() {
	    	
	    	if (this.useRemoteData) {		//picker with remote search capability
	    		
	    		var restUrl = this.restUrl;
	    		
	    		var select2Options = {
	    			placeholder: this.placeHolder,	
	    			minimumInputLength : 2,		
	    			allowClear: this.allowClearing,			
	    			formatInputTooShort : function(term, minLength) {
	    				var rest = minLength - term.length;
	    				return "Please enter " + rest + " more character" + (rest>1 ? "s" : "");
	    			},
	    			formatSearching : function () {
	    					return "Searching...";
	    			},
	    		    quietMillis: 1000,
	    		    ajax: {
	    		    	url: this.restUrl,
	    		    	dataType: 'json',
	    		    	data: function (term, page) {
	                       return {
	                           startkeys: "*" + term + "*", // search term,
	                           count: 30
	                       };
	    		    	},
	    		    	results: function (data, page) { // parse the results into the format expected by Select2.
	                	  
	                	   var _r = [];
	                	   var _hasLabels = null;
	                	   
	                	   
	                	   $(data.items).each( function() {
	                		   
	                		 //check if we have labels or only values
	    	   					if (_hasLabels == null) {
	    	   						_hasLabels = this.hasOwnProperty('@label');
	    	   					}
	                	   
	                		   	var val = this['@value'];
	                		   	var txt = this[ ( _hasLabels ? '@label' : '@value' ) ];

	                		   	_r.push(
	                		   		{ "id" : val, "text" : txt}	
	                		   	);
	       					
	                	   });
	                	   
	       					//array of elements..results: [choice1, choice2, ...], more: true/false }
	                		return {
	                			more : false,
	                			results : _r
	                		}
	                       
	                   }//results
	    		    }, //end ajax function
	    		    initSelection: function(element, callback) {		
	    	            //sets a default value (if a value was selected previously)
	    		    	//default value is retrieve by making a call to the rest service
	    		    	//using the current value
	    	            var id=$(element).val();
	    	            if (id !== "") {
	    	            	
	    	            	$.ajax( {
	    	            		url : restUrl,
	    	            		dataType : 'json',
	    	            		data : {
	    	            			startkeys: "*" + id + "*", // search term,
	    	            			count: 1
	    	            		}
	    	            	}).done ( function(data) {
	    	            		if (data.items && data.items.length == 1) {
	    	            		
		    	            		callback({
	    	            				text : data.items[0]['@label'], 
	    	            				id : data.items[0]['@value'] 
	    	            			});
	    	            		}
	    	            	});
	    	            	
	    	            	
	    				}
	    			}	
	    		};
	    		
	    		if (this.listWidth != null) {
	    			select2Options.width = this.listWidth;
	    		}
	    		
	    		x$(this.control)
	    			.select2(select2Options);
	    			
	    	} else {
	    		
	    		var select2Options = this.getSelect2Options();
	    		
	    		if (this.isNativeSelect) {
	    			//code to execute if select2 is attached to a <select> element 
	    			
	    			var $select = x$(this.control);
	    			
	    			if (this.placeHolder != null || this.allowClearing ) { 
	    				
	    				//add a blank option add the beginning of the option list: required for the placeH
	    				$select.prepend("<option>");
	    				
	    			}
	    	
	    			$select
	    				.select2( select2Options );
	    			
	    		} else {
	    			//code to execute if select2 is attached to a (hidden) input
	    			//data is read using the REST service
	    			
	    			//use maxRowCount here (already set in the ui component)
	    			dojo.xhrGet({
	    				url : this.restUrl + '&count=' + this.maxRowCount,
	    				handleAs: "json"
	    			
	    			})
	    				.then(dojo.hitch(this,this.dataLoaded),dojo.hitch(this,this.dataError));
	    			
	    		} // this.nativeSelect
	    	}
	    	
	    },
	    
	    dataLoaded : function(data) {
	    	//called when the remote data (list of options) is loaded
	    	
	    	var $select = x$(this.thisId);
	    	
			//add a blank option if a placeholder is set
			if (this.placeHolder) {
				$select.append( "<option>" );
			}
			
			//create the options
			var _hasLabels = null;
			
			dojo.forEach( data.items, function(entry, i) {

				var val = entry['@value'];
				
				//check if we have labels or only values
				if (_hasLabels === null) {
					_hasLabels = entry.hasOwnProperty('@label');
				}
				
				var txt = entry[ ( _hasLabels ? '@label' : '@value' ) ];
				
				//create the option
				$select.append(
					$("<option>")
						.attr('value',val)
						.text(txt)	
				)
			});
			
			var controlValue = this.getControlValue(this.control);
			this.controlValues = controlValue ? (this.msep ? controlValue.split(this.msep) : [controlValue]) : [];
			if(this.trim) this.controlValues = dojo.map(this.controlValues,dojo.trim)
			
			this.controlValues = controlValue ? (this.msep ? controlValue.split(this.msep) : [controlValue]) : [];
			if(this.trim) this.controlValues = dojo.map(this.controlValues,dojo.trim)
			
			$select.val(this.controlValues);		//select current value
				
			//setup the select2 picker
			$select
				.select2( this.getSelect2Options() )
					.on("change", { control : this.control }, function(e) {		
						//set value in target (hidden) field on change
						x$(e.data.control).val(e.val);
					});
	    },
	    
	    dataError : function() {
	    	console.error("An error occurred while retrieving the data for the Select2 picker");
	    	
	    },
	    
	    getSelect2Options : function() {
	    	
	    	var select2Options = {
    			placeholder: this.placeHolder,
    			allowClear: this.allowClearing
    		};
	    	
    		if (this.listWidth != null) {
    			select2Options.width = this.listWidth;
    		}
    		
    		if (this.formatSelection != null) {
    			//use a template to render the selected entry
    			
    			var formatSelection = this.formatSelection;
    		
    			select2Options.formatSelection = function(entry) {
    			    if (!entry.id) { return entry.text; } // optgroup
    			    return formatSelection
    			    	.replace(/{value}/g, entry.id)
    			    	.replace(/{text}/g, entry.text);
    			};
    			select2Options.escapeMarkup = function(m) { return m; };
    			
    		}
    		
    		if (this.formatResult != null) {
    			//use a template to render the entries

    			var formatResult = this.formatResult;
    			
    			select2Options.formatResult = function(entry) {
    			    if (!entry.id) { return entry.text; } // optgroup
    			    return formatResult
    			    	.replace(/{value}/g, entry.id)
    			    	.replace(/{text}/g, entry.text);
    			};
    			select2Options.escapeMarkup = function(m) { return m; };
    			
    		}
	    	
	    	return select2Options;
	    	
	    }, 
	    
	    getControlValue : function(id) {
        	var controlValue=null;
        	var element = XSP.getElementById(id);
  			if(XSP.hasDijit()){
  				var djd = dijit.byId(id);
  				if(djd) {
  					controlValue = XSP.getDijitFieldValue(djd)
  				}
  			}
  			if(controlValue==null && element && !element.disabled) {
  				controlValue = XSP.getFieldValue(element);
  			}
  			return controlValue;
          }
	   
	}
);
