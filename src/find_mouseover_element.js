const vectorizeText = require('vectorize-text');
// const make_tooltip_text_args = require('./make_tooltip_text_args');

module.exports = function find_mouseover_element(regl, params, ev){

  // console.log('still_mouseover', params.still_mouseover)

  /*

  Need to use

    params.canvas_pos.x_arr.length
      and
    params.canvas_pos.y_arr.length

  to identify where the user is mousing over

  Also need to take into consideration zooming/panning

  */

  var vect_text_attrs = {
    textAlign: 'right',
    textBaseline: 'middle',
    triangles:true,
    size:params.font_detail,
    font:'"Open Sans", verdana, arial, sans-serif'
  };

  var viz_dim_heat = params.viz_dim.heat;

  // try updating mouseover position
  params.zoom_data.x.cursor_position = ev.x0;
  params.zoom_data.y.cursor_position = ev.y0;

  var inst_x = ev.x0;
  var inst_y = ev.y0;

  // var offcenter;
  // if (axis === 'x'){
  //   offcenter = (params.viz_dim.canvas.width * params.offcenter[axis])/2;
  // } else {
  //   offcenter = (params.viz_dim.canvas.height * params.offcenter[axis])/2;
  // }

  // convert offcenter WebGl units to pixel units
  var offcenter = {};
  offcenter.x = (params.viz_dim.canvas.width * params.offcenter.x)/2;
  offcenter.y = (params.viz_dim.canvas.height * params.offcenter.y)/2;

  var cursor_rel_min = {};
  cursor_rel_min.x = ev.x0 - viz_dim_heat.x.min - offcenter.x;
  cursor_rel_min.y = ev.y0 - viz_dim_heat.y.min - offcenter.y;

  // console.log(cursor_rel_min.x, cursor_rel_min.y)

  cursor_rel_min.x = restrict_rel_min(cursor_rel_min.x, viz_dim_heat.width, params.zoom_data.x);
  cursor_rel_min.y = restrict_rel_min(cursor_rel_min.y, viz_dim_heat.height, params.zoom_data.y);


  if (cursor_rel_min.x < viz_dim_heat.width && cursor_rel_min.y < viz_dim_heat.height){

    console.log(ev)

    var row_index = Math.floor(cursor_rel_min.y/params.tile_pix_height);
    var col_index = Math.floor(cursor_rel_min.x/params.tile_pix_width);

    // console.log(params.orderd_labels)
    params.mouseover.row_name = params.ordered_labels.rows[row_index];
    params.mouseover.col_name = params.ordered_labels.cols[col_index];

    if (params.mouseover.row_name.includes(': ')){
      params.mouseover.row_name = params.mouseover.row_name.split(': ')[1];
    }

    if (params.mouseover.col_name.includes(': ')){
      params.mouseover.col_name = params.mouseover.col_name.split(': ')[1];
    }

    var mouseover_text;
    if (params.cat_num.col == 0){
      // calculate text triangles, they require an offset element
      mouseover_text = params.mouseover.row_name + ' and ' + params.mouseover.col_name;
      params.mouseover.text_triangles['line-1'] = vectorizeText(mouseover_text, vect_text_attrs);
      params.mouseover.text_triangles['line-1'].offset = [0,0];
    } else {
      // calculate text triangles, they require an offset element
      mouseover_text = params.mouseover.row_name + ' and ' + params.mouseover.col_name;
      params.mouseover.text_triangles['line-1'] = vectorizeText(mouseover_text, vect_text_attrs);
      params.mouseover.text_triangles['line-1'].offset = [0,0];

      params.mouseover.col_cat = params.ordered_labels.col_cats[col_index];
      mouseover_text = params.mouseover.col_cat;
      params.mouseover.text_triangles['line-2'] = vectorizeText(mouseover_text, vect_text_attrs);
      params.mouseover.text_triangles['line-2'].offset = [0,0];
    }


    // // make the arguments for the draw command
    // params.mouseover.text_triangle_args = make_tooltip_text_args(regl, params, line_offset=2.5);

    params.in_bounds_tooltip = true;
  } else {
    // console.log('OUTSIDE OF MATRIX')
    params.in_bounds_tooltip = false;
  }


  function restrict_rel_min(cursor_rel_min, max_pix, zoom_data){

    cursor_rel_min = cursor_rel_min / zoom_data.total_zoom - zoom_data.total_pan_min;

    // console.log(viz_dim_heat.max)
    if (cursor_rel_min < 0){
      cursor_rel_min = 0;
    } else if (cursor_rel_min > max_pix){
      cursor_rel_min = max_pix;
    }
    return cursor_rel_min;
  }

};