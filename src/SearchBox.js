import React, { useState, useEffect } from "react";
import { useSharedContext } from "./SharedContextProvider";

export default function({ customQuery, fields, id, initialValue, placeholder }) {
  const [{ widgets }, dispatch] = useSharedContext();
  const [value, setValue] = useState(initialValue || "");

  // Update external query on mount.
  useEffect(() => {
    update(value);
  }, []);

  // If widget value was updated elsewhere (ex: from active filters deletion)
  // We have to update and dispatch the component.
  useEffect(() => {
    widgets.get(id) && update(widgets.get(id).value);
  }, [isValueReady()]);

  // Build a query from a value.
  function queryFromValue(value) {
    console.log("queryFromValue", value);
    if (customQuery) {
      return customQuery(value);
    } else if (value) {
      //@todo . if no fields specified, error message !
      return { query: { multi_match: { query: value, type: "phrase", fields } } };
    }
    return { query: { match_all: {} } };
  }

  // This functions updates the current values, then dispatch
  // the new widget properties to context.
  // Called on mount and value change.
  function update(v) {
    setValue(v);
    dispatch({
      type: "setWidget",
      key: id,
      needsQuery: true,
      needsConfiguration: false,
      isFacet: false,
      wantResults: false,
      query: queryFromValue(v),
      value: v,
      configuration: null,
      result: null
    });
  }

  // Checks if widget value is the same as actual value.
  function isValueReady() {
    return !widgets.get(id) || widgets.get(id).value == value;
  }

  return (
    <div className="react-es-searchbox">
      <input
        type="text"
        value={value}
        onChange={e => update(e.target.value)}
        placeholder={placeholder || "search…"}
      />
    </div>
  );
}
