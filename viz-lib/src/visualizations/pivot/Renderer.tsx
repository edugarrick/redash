import React, { useState, useEffect, useMemo } from "react";
import { get, find, pick, map, mapValues } from "lodash";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import PivotTableUI from "react-pivottable/PivotTableUI";
import { RendererPropTypes } from "@/visualizations/prop-types";
import { formatColumnValue } from "@/lib/utils";
import { interpolateRdBu } from "d3-scale-chromatic";
import * as d3 from 'd3';

import "react-pivottable/pivottable.css";
import "./renderer.less";

const VALID_OPTIONS = [
  "rows",
  "cols",
  "vals",
  "aggregatorName",
  "valueFilter",
  "sorters",
  "rowOrder",
  "colOrder",
  "derivedAttributes",
  "rendererName",
  "hiddenAttributes",
  "hiddenFromAggregators",
  "hiddenFromDragDrop",
  "menuLimit",
  "unusedOrientationCutoff",
  "controls",
  "rendererOptions",
];

function lighten (color: any, amount: any) {
  const r = d3.rgb(color).r;
  const g = d3.rgb(color).g;
  const b = d3.rgb(color).b;
  const newColor = d3.rgb(
      ( r + (255 - r) * amount ),
      ( g + (255 - g) * amount ),
      ( b + (255 - b) * amount ),
  );
  return newColor.toString();
}


function formatRows({ rows, columns }: any) {
  return map(rows, row => mapValues(row, (value, key) => formatColumnValue(value, find(columns, { name: key }).type)));
}

export default function Renderer({ data, options, onOptionsChange }: any) {
  const [config, setConfig] = useState({ ...options });
  const dataRows = useMemo(() => formatRows(data), [data]);

  useEffect(() => {
    setConfig({ ...options });
  }, [options]);

  const onChange = (updatedOptions: any) => {
    const validOptions = pick(updatedOptions, VALID_OPTIONS);
    setConfig({ ...validOptions });
    onOptionsChange(validOptions);
  };

  // Legacy behavior: hideControls when controls.enabled is true
  const hideControls = get(options, "controls.enabled");
  const hideRowTotals = !get(options, "rendererOptions.table.rowTotals");
  const hideColumnTotals = !get(options, "rendererOptions.table.colTotals");
  return (
    <div
      className="pivot-table-visualization-container"
      data-hide-controls={hideControls || null}
      data-hide-row-totals={hideRowTotals || null}
      data-hide-column-totals={hideColumnTotals || null}
      data-test="PivotTableVisualization">
      <PivotTableUI {...pick(config, VALID_OPTIONS)} data={dataRows} onChange={onChange} 
                      tableColorScaleGenerator={(values:any) => {
                        const min = Math.min.apply(Math, values);
                        const max = Math.max.apply(Math, values);
                        const range = max - min;
                        return (x: any) => {
                          const progress = (max - x) / range;
                          const backgroundColor = lighten( interpolateRdBu(progress) ,0.3)
                          return { backgroundColor };
                        };
                      }}
      />
    </div>
  );
}

Renderer.propTypes = RendererPropTypes;
Renderer.defaultProps = { onOptionsChange: () => {} };
