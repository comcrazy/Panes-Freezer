/*!
 * jQuery Panes Freezer v0.1.0 - Freeze the table column and row for ease of navagating
 * 
 * Copyright (c) 2011 James ong, http://comcrazy.info/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * http://comcrazy.info/2011/10/jquery-panes-freezer.html
 *
 * -----
 * 
 */
 
(function( $ ){
    
	/**
	 * All the funciton for this jquery plugin */
    var methods = {
        
		/**
		 * Constructor of panesfreezer
		 * Parameters
		 * headerrow		Number of row to freeze
		 * headercolumn		Number of column to freeze
		 */
        init : function( options ) { 
            return this.each(function() {
				/* default setting */
                var settings = {
                    'headerrow'    : 1,
                    'headercolumn' : 0
                };        
                                
                /* Get user define option */
                if ( options ) { 
                    $.extend( settings, options );
                }
                
				/* Check the element and initiate this plugin is a div */
                if (!$(this).is("div")) {
                    $.error( 'jQuery.staticheader: Only can initiate at a DIV element:'+ $(this).attr('id'));
                }
                
				/* Must have only one element under this div which is table */
                if ($(this).children().length == 0) {
                    $.error( 'jQuery.staticheader: There must be a TABLE element under this DIV:'+ $(this).attr('id') );
                }                 
                
				/* Check is the element table */
                if ($(this).children().length > 1 || !$($(this).children().get(0)).is('table')) {
                    $.error( 'jQuery.staticheader: There only can be one element under this DIV and must be TABLE:'+ $(this).attr('id') );
                }           
                
				/* The table must be have a id */
                if ($($(this).children().get(0)).attr('id') == undefined || $($(this).children().get(0)).attr('id') == '') {
                    $.error( 'jQuery.staticheader: TABLE element must had uniqeu ID:'+ $(this).attr('id') );
                }
                
				
                var header_table = "";
				var header_col_table = "";
				var header_col_table_width = 0;
                var header_table_height = 0;
                var column_table = "";
                var column_table_width = 0;
				
                var column_width_repo = new Array();
				var column_height_repo = new Array();
                var column_padding_margin_repo = new Array();
				
				/* Capture the div element */
                var maindiv = $(this);
				
				/* Capture the div id */
                var maindiv_id=$(this).attr('id');
				
				/* Capture the table element */
                var thetable = $($(this).children().get(0));

				/* Capture the table width */
                var orig_table_width = $(thetable).width();
				
				/* Capture the first tr element */
                var firstrow = thetable.children().get(0);
				
				/* Get table width offset inlcuding border, padding and margin */
				var table_width_offset = methods.getTableWidthOffset(thetable);
										
                /* Detect is there any element under table element */
				if (firstrow == undefined) {
                    $.error( 'jQuery.staticheader: No row found in table' );
                }

				/* Fir the first element is not tr, tbody or thead, then error */
                if (!$(firstrow).is('tr') && !$(firstrow).is('thead') && !$(firstrow).is('tbody')) {
                    $.error( 'jQuery.staticheader: Expect first row should either be THEAD or TR element' );
                }                  
                
                /* Process row pane freeze */
                if (settings['headerrow'] > 0) {
                    
                    var nextdatarow = null;
                    var thead = null;
                    var tbody = null;

                    /* If thead or tbody then go to its node which expect tr */
                    if ($(firstrow).is('thead')) {
                        thead = $(firstrow);
                        firstrow = $(firstrow).children().get(0);
                    } else if ($(firstrow).is('tbody') ) {
                        tbody = $(firstrow);
                        firstrow = $(firstrow).children().get(0);                        
                    }
                    
					/* if not tr, then quit */
                    if ($(!firstrow).is('tr')) {
                        $.error( 'jQuery.staticheader: Expect TR element under THEAD element' );
                    }

                    /* Get the data node */
                    var counter = settings['headerrow'];
                    do {
						/* If thead or tbody is detect, get the element under the thead */
                        if (thead != null) {
                            nextdatarow = thead.children().get(counter);
                        } else if (tbody != null) {
                            nextdatarow = tbody.children().get(counter);
                        } 
                        
						/* Find the first data row */
                        if (nextdatarow == undefined || nextdatarow == null ) {
							if (thead != null) {
								var table_child_counter = 1;													
								nextdatarow = thetable.children().get(table_child_counter);
								table_child_counter++;
								if ($(nextdatarow).is('tfoot')) {
									nextdatarow = thetable.children().get(table_child_counter);
									table_child_counter++;								
								}
								
								if ($(nextdatarow).is('tbody') ) {
									nextdatarow = $(nextdatarow).children().get(counter - thead.children().length);                        
								} else {
									nextdatarow = null;
									break;								
								}			
							} else {
								nextdatarow = null;
								break;
							}
                        }                        
                        counter++;
                        
                    } while (!$(nextdatarow).is('tr'));		
					
                    /* Get the number of row */
                    var tmp_header_row_counter = settings['headerrow'];                                
                    var tmp_header_row_pos = 0;  
					
					/* Array to store the row going to be removed because move to new header table */
                    var will_be_remove_row = new Array();

					/* Table tag, copy all the element attribute from orignal table */
                    header_table += '<table ';
                    header_table += methods.getElementAttribute.apply(this, new Array (thetable));                                    
                    header_table += '>';    
					
					/* If both column and row is selected to freeze, a new table is located at top left */
					if (settings['headercolumn'] > 0) {
						header_col_table += '<table ';
						header_col_table += methods.getElementAttribute.apply(this, new Array (thetable));                                    
						header_col_table += '>'; 
					}

					/* Loop the tr to extract it out */
                    while (tmp_header_row_counter > 0) {
						/* Get cell height */
                        header_table_height += methods.getAbsoluteCellHeight($(firstrow));

						/* construct header row and header column table */
                        header_table += '<tr ';                                        
                        header_table += methods.getElementAttribute.apply(this, new Array (firstrow));    
                        header_table += '>';
						
						if (settings['headercolumn'] > 0) {
							header_col_table += '<tr ';                                        
							header_col_table += methods.getElementAttribute.apply(this, new Array (firstrow));    
							header_col_table += '>';						
						}		

						/* Loop each TD in the row */
                        $(firstrow).children().each(function(index) {	
							var currtd_html = '';
							var got_colspan = false;							
							
							/* Detect is td or th */
                            var $tag = $(this).is('td')?'td':$(this).is('th')?'th':'';
                            currtd_html += '<'+$tag+' ';      
                            currtd_html += methods.getElementAttribute.apply(this, new Array(this));
							
							if (currtd_html.match('rowspan') && $(this).attr('rowspan')>1) {							
								$.error( 'jQuery.staticheader: Unexpected table cell with rowspan detected. Cell with rowspan must not be used as row header.' );
							}
							
							if (currtd_html.match('colspan') && $(this).attr('colspan')>1) {
								got_colspan = true;
							}

							/* Get same position cell from next row */
							var second_row_cell = $(nextdatarow).children().get(index);															
							
							/* Get the height and width */
							var currwidth = 0;
							var currheight = methods.getAbsoluteCellHeight($(this));

							/* Store to array, but only first row */
							if (column_width_repo[index] == undefined && !got_colspan) {
								currwidth = methods.getAbsoluteCellWidth($(this));
								column_width_repo[index] = currwidth; 							
							} else if (!got_colspan){
								/* For next row, use back the first row width */
								currwidth = column_width_repo[index];
							} else {
								currwidth = methods.getAbsoluteCellWidth($(this));
							}
							
							column_padding_margin_repo[index] = methods.getCellWidthOffset($(this));

							if (currwidth != 0 && !got_colspan) {
								/* Assign width, padding and margin on the first data row */  
								$(second_row_cell).css('min-width', currwidth+'px');
								$(second_row_cell).css('max-width', currwidth+'px');
								$(second_row_cell).css('width', currwidth+'px');							
							}
							
							if (currwidth != 0) {
								/* Asign the width */
								if (currtd_html.match('style=')) {
									currtd_html = currtd_html.replace(/style="/i, 'style="width:'+currwidth+'px;min-width:'+currwidth+'px; max-width:'+currwidth+'px ');  
								} else {
									currtd_html += 'style="width:'+currwidth+'px;min-width:'+currwidth+'px; max-width:'+currwidth+'px" ';
								}
							}
							
							/* Set the height */
							currheight = methods.getAbsoluteCellHeight($(this));
							
							if (currtd_html.match('height:') && currheight != '' && currheight != undefined) {
								currtd_html = currtd_html.replace(/min-height:(\S|\s)[0-9]*(\S|\s)x;/i, 'min-height:'+(currheight)+'px;');
								currtd_html = currtd_html.replace(/min-height:(\S|\s)[0-9]*(\S|\s)x/i, 'min-height:'+(currheight)+'px');
								currtd_html = currtd_html.replace(/max-height:(\S|\s)[0-9]*(\S|\s)x;/i, 'max-height:'+(currheight)+'px;');
								currtd_html = currtd_html.replace(/max-height:(\S|\s)[0-9]*(\S|\s)x/i, 'max-height:'+(currheight)+'px');
								currtd_html = currtd_html.replace(/height:(\S|\s)[0-9]*(\S|\s)x;/i, 'height:'+(currheight)+'px;' );
								currtd_html = currtd_html.replace(/height:(\S|\s)[0-9]*(\S|\s)x/i, 'height:'+(currheight)+'px');
							} else if (currtd_html.match('height=') && currheight != '' && currheight != undefined) {
								currtd_html = currtd_html.replace(/height="[0-9]*px"/i, 'height="'+(currheight)+'px"');    
							} else if (currtd_html.match('style=') && currheight != '' && currheight != undefined) {
								currtd_html = currtd_html.replace(/style="/i, 'style="height:'+(currheight)+'px; ');  
							} else if (currheight != '' && currheight != undefined) {
								currtd_html +=  ' style="height:'+(currheight)+'px" ';
							}  
							
							/* Get cell content and  Close TD / TD tag */
							currtd_html += '>'+$(this).html();     
							currtd_html += '</'+$tag+'>'; 	
							
							/* Add to correct place holder */
							if (settings['headercolumn'] > 0 && index < settings['headercolumn']) {	
								/* Store the header column table width */
								if (index == 0) {
									header_col_table_width +=  currwidth + methods.getCellWidthOffset($(this));
								}
							    header_col_table += currtd_html;								
							} else {						
							    header_table += currtd_html;
							}
                        });
						
						/* Close the tr */
                        header_table += '</tr>';
						if (settings['headercolumn'] > 0) {
							header_col_table += '</tr>';
						}
						
						/* Store first, remove later. If remove now, cell width of following row may not accurate */
                        will_be_remove_row [tmp_header_row_pos] = firstrow;

                        /* Check and continue next header row */
                        tmp_header_row_counter--;
                        tmp_header_row_pos++;

						/* Get next row */
                        if (tmp_header_row_counter > 0) {
                            if (thead != null) {
                                firstrow = thead.children().get(tmp_header_row_pos);
                            } else if (tbody != null) {
							    firstrow = tbody.children().get(tmp_header_row_pos);
							} else {
                                firstrow = thetable.children().get(tmp_header_row_pos);
                            }

                            if (firstrow == undefined || firstrow == null) {
								if (thead != null) {									
									firstrow = thetable.find('tbody')
									if (firstrow != undefined) {
										firstrow = $(firstrow).children().get(0);                        
									} else {
										tmp_header_row_counter = 0;							
									}													
								} else {
									tmp_header_row_counter = 0;
								}
                            }
                        }                                                
                    }                                 

					/* Remove all the row that become header */
					jQuery.each(will_be_remove_row, function(pos)  {
						$(will_be_remove_row[pos]).remove();
					});
						
					/* Close table tag */
                    header_table += '</table>';
					if (settings['headercolumn'] > 0) {
						header_col_table += '</table>';
					}					
                }
                
                /* Process column pane freeze */
                if (settings['headercolumn'] > 0) {
					var row_span_repo = new Array ();
                    var tr_data = '<tbody>';     
                    var tfoot_data = '<tfoot>';               				
                    
					/* Get all tr in table */
                    var all_tr = $(thetable).find('tr');
					
					/* Loop each tr */
                    $(all_tr).each(function(index) {						
                        var curr_row_height = 0;                        
						
						/* Check is tfoot */
                        var istfoot = $(this).parent().is('tfoot');
                        
						/* Generate the tr tag */
                        var tr_start = "<tr ";
                        tr_start += methods.getElementAttribute.apply(this, new Array(this)); 
                        tr_start += ">";
                        
						/* Store the number of column to be freeze */
                        var tmp_header_column_counter = settings['headercolumn'];                                
                        var tmp_header_column_pos = 0;  
                        var td_data = ""; 
						var prev_rowspan = false;
                        
						/* Loop each column that need to freeze */
                        while (tmp_header_column_counter > 0) {   
							var target_td_pos = tmp_header_column_pos;
							
							/* If got prev row span, skip the td until row span is equal to 1 */
							if (row_span_repo[tmp_header_column_pos] != undefined && row_span_repo[tmp_header_column_pos] > 1)
							{
								row_span_repo[tmp_header_column_pos] = row_span_repo[tmp_header_column_pos] - 1;
								tmp_header_column_pos ++;
								tmp_header_column_counter --;	
								prev_rowspan = true;
								continue;
							} 
							
							if (prev_rowspan)
							{
								prev_rowspan = false;
								target_td_pos --
							}
							
							/* Get current and next cell */
                            var curr_td = $(this).children().get(target_td_pos); 

							/* Check type of cell */
                            var tag = $(curr_td).is('td')? 'td':$(curr_td).is('th')?'th':'';
                            var cell_data = "";    
							var is_rowspan = false;
							
							/* Generate opening tag */
							cell_data += '<'+tag+' ';               
							cell_data += methods.getElementAttribute.apply(this, new Array(curr_td));  

							if (cell_data.match('colspan') && $(curr_td).attr('colspan')>1) {							
								$.error( 'jQuery.staticheader: Unexpected table cell with colspan detected. Cell with colspan must not be used as column header.' );
							}
							
							/* Store to array for next td with same pos used */
							if (cell_data.match('rowspan') && $(curr_td).attr('rowspan')>1) {						
								row_span_repo[tmp_header_column_pos] = $(curr_td).attr('rowspan');
								is_rowspan = true;
							}
							
							/* Get the height for entire row from first cell only */
                            if ((tmp_header_column_pos == 0 && !is_rowspan) || tmp_header_column_pos > 0 && row_span_repo[(tmp_header_column_pos-1)] != undefined) {
                                curr_row_height = methods.getAbsoluteCellHeight($(curr_td));								
                            }
							
							/* Get current cell width from repo, if now, use current cell with */
							var td_width = column_width_repo[tmp_header_column_pos]==undefined?$(curr_td).width():column_width_repo[tmp_header_column_pos];							
							
							/* Store the width of curent freeze pane */
							if (index == 0) {
								column_table_width += (td_width + (column_padding_margin_repo[tmp_header_column_pos]==undefined?
									methods.getCellWidthOffset($(curr_td)):
									column_padding_margin_repo[tmp_header_column_pos])); 
							}

							/* set the width for the cell */
							if (cell_data.match('width:') && td_width != '' && td_width != undefined) {
								cell_data = cell_data.replace(/min-width:(\S|\s)[0-9]*(\S|\s)x;/i, 'min-width:'+(td_width)+'px;');
								cell_data = cell_data.replace(/min-width:(\S|\s)[0-9]*(\S|\s)x/i, 'min-width:'+(td_width)+'px');
								cell_data = cell_data.replace(/max-width:(\S|\s)[0-9]*(\S|\s)x;/i, 'max-width:'+(td_width)+'px;');
								cell_data = cell_data.replace(/max-width:(\S|\s)[0-9]*(\S|\s)x/i, 'max-width:'+(td_width)+'px');
								cell_data = cell_data.replace(/width:(\S|\s)[0-9]*(\S|\s)x;/i, 'width:'+(td_width)+'px;' );
								cell_data = cell_data.replace(/width:(\S|\s)[0-9]*(\S|\s)x/i, 'width:'+(td_width)+'px');
							} else if (cell_data.match('width=') && td_width != '') {
								cell_data = cell_data.replace(/width="[0-9]*px"/i, 'width="'+(td_width)+'px"');   
							} else if (cell_data.match('style=') && td_width != '' && td_width != undefined) {
								cell_data = cell_data.replace(/style="/i, 'style="width:'+(td_width)+'px; ');  										
							} else if (td_width != 0) {
								cell_data +=  ' style="width:'+(td_width)+'px" ';
							}
							            
							/* set the height for the cell */
							var td_height = methods.getAbsoluteCellHeight($(curr_td));									                              
							
							if (cell_data.match('height:') && td_height != '' && td_height != undefined) {
								cell_data = cell_data.replace(/min-height:(\S|\s)[0-9]*(\S|\s)x;/i, 'min-height:'+(td_height)+'px;');
								cell_data = cell_data.replace(/min-height:(\S|\s)[0-9]*(\S|\s)x/i, 'min-height:'+(td_height)+'px');
								cell_data = cell_data.replace(/max-height:(\S|\s)[0-9]*(\S|\s)x;/i, 'max-height:'+(td_height)+'px;');
								cell_data = cell_data.replace(/max-height:(\S|\s)[0-9]*(\S|\s)x/i, 'max-height:'+(td_height)+'px');
								cell_data = cell_data.replace(/height:(\S|\s)[0-9]*(\S|\s)x;/i, 'height:'+(td_height)+'px;' );
								cell_data = cell_data.replace(/height:(\S|\s)[0-9]*(\S|\s)x/i, 'height:'+(td_height)+'px');
							} else if (cell_data.match('height=') && td_height != '') {
								cell_data = cell_data.replace(/height="[0-9]*px"/i, 'height="'+(td_height)+'px"');   
							} else if (cell_data.match('style=') && td_height != '' && td_height != undefined) {
								cell_data = cell_data.replace(/style="/i, 'style="height:'+(td_height)+'px; ');  										
							} else if (td_height != 0) {
								cell_data +=  ' style="height:'+(td_height)+'px" ';
							} 
							
							/* Close cell tag */
							cell_data += ">";
							cell_data += $(curr_td).html();
							cell_data += '</'+tag+'>';  
								
                            td_data += cell_data;
                                                        
                            tmp_header_column_pos ++;
                            tmp_header_column_counter --;
                        }
						
						/* Store to correct place holder */
                        if (istfoot) {
                            tfoot_data += tr_start+td_data+"</tr>";
                        } else {
                            tr_data += tr_start+td_data+"</tr>";
                        }               
                        
                        /* Set height for the cell of data table of current row */
                        var tmp_td = $(this).children().get(); 
                        if (tmp_td != undefined) {
                            $(tmp_td).css('height', curr_row_height);
                            $(tmp_td).css('min-height', curr_row_height);
                            $(tmp_td).css('max-height', curr_row_height);							
                        }
                        
                    });
                              
                    /* Remove td, cannot perform ealier loop because will make cell height in accurate */
                    all_tr = $(thetable).find('tr');
					row_span_repo = new Array ();
					
					/* Loop again for all tr */
                    $(all_tr).each(function() {
                        var will_be_remove_column = new Array(); 
                        var tmp_header_column_counter = settings['headercolumn'];                                
                        var tmp_header_column_pos = 0;  
                        
						/* Get all the td need to be removed */
                        while (tmp_header_column_counter > 0) {  
							/* If got prev row span, skip the td until row span is equal to 1 */
							if (row_span_repo[tmp_header_column_pos] != undefined && row_span_repo[tmp_header_column_pos] > 1)
							{
								row_span_repo[tmp_header_column_pos] = row_span_repo[tmp_header_column_pos] - 1;
								tmp_header_column_pos ++;
								tmp_header_column_counter --;								
								continue;
							}
							
                            var curr_td = $(this).children().get(tmp_header_column_pos);  
							
							/* Store to array for next td with same pos used */
							if ($(curr_td).attr('rowspan')>1) {						
								row_span_repo[tmp_header_column_pos] = $(curr_td).attr('rowspan');
								is_rowspan = true;
							}
							
                            will_be_remove_column[tmp_header_column_pos] = curr_td;                            
                            tmp_header_column_pos ++;
                            tmp_header_column_counter --;
                        }
                       
						/* Removed it */
                        jQuery.each(will_be_remove_column, function(pos)  {
                            $(will_be_remove_column[pos]).remove();
                        });                          
                    });
                    
					/* Generate the left column table */
                    column_table += '<table ';
                    column_table += methods.getElementAttribute.apply(this, new Array(thetable));     
    
                    column_table = column_table.replace(/min-width:(\S|\s)[0-9]*(\S|\s)x;/i, '');
                    column_table = column_table.replace(/min-width:(\S|\s)[0-9]*(\S|\s)x/i, '');
                    column_table = column_table.replace(/max-width:(\S|\s)[0-9]*(\S|\s)x;/i, '');
                    column_table = column_table.replace(/max-width:(\S|\s)[0-9]*(\S|\s)x/i, '');
                    column_table = column_table.replace(/width:(\S|\s)[0-9]*(\S|\s)x;/i, '' );
                    column_table = column_table.replace(/width:(\S|\s)[0-9]*(\S|\s)x/i, '');                    
                    column_table = column_table.replace(/width="[0-9]*px"/i, '');
                    
                    column_table += '>';
                    column_table += tr_data+'</tbody>'+tfoot_data+'</tfoot>';                    
                    column_table += '</table>'
                }
 
                /* Re adjust the table width since some column had been deleted */                
                $(thetable).width(orig_table_width-column_table_width);                
                $(thetable).find('thead').children().length == 0?$(thetable).find('thead').remove():null;
                
                var final_html = '';
				
				/* If got row header */
				if (header_col_table.length != 0 || header_table.length !=0) {
					final_html += '<div id="staticheader_hs_'+maindiv_id+'"  >'; 
					
					/* row column header at top left */
					if (header_col_table.length != 0) {
						final_html += '<div id="staticheader_subhs1_'+maindiv_id+'" style="float: left;">';
						final_html += header_col_table;
						final_html += '</div>';
					}
					
					/* row header at top right */
					if (header_table.length !=0) {
						final_html += '<div id="staticheader_subhs2_'+maindiv_id+'" style="float: left; overflow: hidden;  width:'+($(this).width()-column_table_width-table_width_offset-(2*settings['headercolumn'])-20)+'px">';

						final_html += header_table;
						final_html += '</div>';
					}
					
					final_html += '</div>';
				}

				/* Main section */
                final_html += '<div id="staticheader_hp_'+maindiv_id+'">'
                
				/* Left column table */
				if (column_table.length != 0) {
					final_html += '<div id="staticheader_subhp1_'+maindiv_id+'" style="float: left;">';
					final_html += '<div id="staticheader_chs_'+maindiv_id+'" style="overflow: hidden; overflow: hidden; height: '+($(this).height()-(header_table_height+35))+'px;">';
					final_html += column_table;
					final_html += '</div>';
					final_html += '</div>';
				}

				/* Main Table */
                final_html += '<div id="staticheader_subhp2_'+maindiv_id+'" style="float: left">';
                final_html += '<div id="staticheader_cs_'+maindiv_id+'" style="overflow: hidden; height: '+($(this).height()-(header_table_height+35))+'px; width:'+($(this).width()-column_table_width-table_width_offset-(2*settings['headercolumn'])-20)+'"px>';
                final_html += maindiv.html();
                final_html += '</div>';
                final_html += '</div>';
			
				/* Add horizontal scroll bar */
				final_html += '<div id="staticheader_subhp3_'+maindiv_id+'" style="float:left">';
				final_html += '<div id="staticheader_hscr_'+maindiv_id+'" style="overflow: auto; width: 20px; height:'+($(this).height()-(header_table_height+35))+'px;"><div style="margin: 0 0; padding:0 0; width: 1px; height: '+($(thetable).height()+35)+'px;  background-color: grey"></div></div>';
				final_html += '</div>';
				final_html += '</div>';
			
				/* Add vertical scrollbar */                                    
				final_html += '<div id="staticheader_vscr_'+maindiv_id+'" style="padding: 0px; margin-left:'+(settings['headercolumn']>0?(column_table_width+table_width_offset+(2*settings['headercolumn'])):0)+'px; float: left; overflow: auto;height: 20px; clear:both; width:'+($(this).width()-column_table_width-table_width_offset-(2*settings['headercolumn'])-20)+'"px; background-color: grey">';
				final_html += '<div style="margin: 0 0; padding:0 0;  width: '+($(thetable).width()+table_width_offset)+'px; height: 1px">';
				final_html += '</div>';
				final_html += '</div>';
			
				/* Output to browser screen */
                maindiv.html(final_html); 

				/* Add scroll event trigger on horizontal and vertical scroll bar */
                $('#staticheader_vscr_'+maindiv_id).scroll( function() {  
                    $('#staticheader_subhs2_'+maindiv_id).scrollLeft($('#staticheader_vscr_'+maindiv_id).scrollLeft());
                    $('#staticheader_cs_'+maindiv_id).scrollLeft($('#staticheader_vscr_'+maindiv_id).scrollLeft());
                });

                $('#staticheader_hscr_'+maindiv_id).scroll( function() {
                    $('#staticheader_cs_'+maindiv_id).scrollTop($('#staticheader_hscr_'+maindiv_id).scrollTop());
                    $('#staticheader_chs_'+maindiv_id).scrollTop($('#staticheader_hscr_'+maindiv_id).scrollTop());
                    
                });   
                
				/* Align all table to left */
                maindiv.css('text-align', 'left');
                
            })
        },
        
		/**
		 * getElementAttribute - get element attribute
		 * Parameters
		 * curr_element		Selected HTML element
		 */		
        getElementAttribute: function (curr_element) {
			if (curr_element == undefined) {
				return '';
			}
			
			/* Currently not include any event attribute */
            var attr_list = ['border', 'class', 'style', 'cellpadding', 'cellspacing', 'valign', 'title', 'lang', 
				'dir', 'accesskey', 'tabindex', 'colspan', 'rowspan'];
            var attr_str = '';
            
			/* Loop each attribute and construct the attribute string again */
            jQuery.each(attr_list, function(pos, value)  {               
                if ($(curr_element).attr(value) != undefined && $(curr_element).attr(value) != "") {
                    attr_str += this+'="'+$(curr_element).attr(value)+'" ';
                }  
            });
            
            return attr_str
        },
		
		/**
		 * getTableWidthOffset - get table width offset
		 * Parameters
		 * curr_element		Selected table element
		 */				
        getTableWidthOffset: function (curr_element) {
			var tmpvalue = 0;
			
			/* Need to mutilple by two because two side */
			if (curr_element.attr('border')!=undefined && curr_element.attr('border')!="") {
				tmpvalue += (curr_element.attr('border')*2)
			}
			if (curr_element.css('border-width') != "") {				
				tmpvalue += (methods.px2Int(new Array(curr_element.css('border-width')))*2);
			}
			if (curr_element.css('margin-left') != "") {
				tmpvalue += methods.px2Int(new Array(curr_element.css('margin-left')));
			}
			if (curr_element.css('margin-right') != "") {
				tmpvalue += methods.px2Int(new Array(curr_element.css('margin-right')));
			}
			if (curr_element.css('padding-left') != "") {
				tmpvalue += methods.px2Int(new Array(curr_element.css('padding-left')));
			}
			if (curr_element.css('padding-right') != "") {
				tmpvalue += methods.px2Int(new Array(curr_element.css('padding-right')));
			}
			
			/*if (curr_element.css('border-spacing') != "") {
				tmp_value = curr_element.css('border-spacing').split(' ');
				tmpvalue += methods.px2Int(new Array(tmp_value[0]));
				tmpvalue += methods.px2Int(new Array(tmp_value[1]));
			}		*/	
			
			return tmpvalue;
		},
		
		/**
		 * getCellWidthOffset - get cell width offset
		 * Parameters
		 * curr_element		Selected cell element
		 */		
		getCellWidthOffset: function (curr_element) {
			var tmpvalue = 0;
			
			if (curr_element.css('padding-left') != "") {
				tmpvalue += methods.px2Int(new Array($(curr_element).css('padding-left')));
			}
			if (curr_element.css('padding-right') != "") {			
				tmpvalue += methods.px2Int(new Array($(curr_element).css('padding-right')));
			}
			if (curr_element.css('margin-left') != "") {
				tmpvalue += methods.px2Int(new Array($(curr_element).css('margin-left')));
			}
			if (curr_element.css('margin-right') != "") {			
				tmpvalue += methods.px2Int(new Array($(curr_element).css('margin-right')));
			}				

			if (curr_element.css('border-spacing') != "") {
				tmp_value = curr_element.css('border-spacing').split(' ');
				tmpvalue += methods.px2Int(new Array(tmp_value[0]));
				tmpvalue += methods.px2Int(new Array(tmp_value[1]));
			}
			
			return tmpvalue;
		},
		
		/**
		 * getAbsoluteCellHeight - get height of a cell 
		 * Parameters
		 * curr_cell		Selected cell element
		 */			
		getAbsoluteCellHeight: function (curr_cell) {
			return curr_cell.height()>curr_cell[0].offsetHeight?curr_cell.height():curr_cell[0].offsetHeight;
		},
			
		/**
		 * getAbsoluteCellWidth - get width of a cell 
		 * Parameters
		 * curr_cell		Selected cell element
		 */			
		getAbsoluteCellWidth: function (curr_cell) {		
			return curr_cell.width()>curr_cell[0].offsetWidth?curr_cell.width():curr_cell[0].offsetWidth;
		},
		
		/**
		 * px2Int - remove px from given string 
		 * Parameters
		 * astring		A string expect got numeric value with px
		 */				
        px2Int: function (astring) {      	
			if (astring == undefined || astring == '') {
				return 0;
			}			
            return (astring[0].replace(/px/i, '')*1);
        }        
    };

	/* Main stub */
    $.fn.panesfreezer = function( method ) {
    
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.panesfreezer' );
        }    
  
    };

})( jQuery );