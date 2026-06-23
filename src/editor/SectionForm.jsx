import React, { useState } from "react";
import { setIn, addItem, removeItem, emptyItem } from "../data/proposalOps.js";
import { TextField, NumberField, ImageDrop, IconPicker } from "./fields.jsx";

function getIn(obj, path) {
  return path.reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

// Renderiza um campo simples. `basePath` é o caminho até o objeto que contém `field.path`.
function Field({ field, data, basePath, onChange }) {
  const path = [...basePath, ...field.path];
  const value = getIn(data, path);
  const set = (v) => onChange(setIn(data, path, v));
  switch (field.type) {
    case "text": return <TextField label={field.label} value={value} onChange={set} />;
    case "textarea": return <TextField label={field.label} value={value} onChange={set} textarea />;
    case "number": return <NumberField label={field.label} value={value} onChange={set} />;
    case "image": return <ImageDrop label={field.label} value={value} onChange={set} />;
    case "icon": return <IconPicker label={field.label} value={value} onChange={set} />;
    case "list": return <ListField field={field} data={data} basePath={basePath} onChange={onChange} />;
    default: return null;
  }
}

// Lista repetível com + adicionar / × remover. Suporta itens objeto e itens string
// (itemFields com path []), e aninhamento (ex.: canais > linhas).
function ListField({ field, data, basePath, onChange }) {
  const listPath = [...basePath, ...field.path];
  const items = getIn(data, listPath) || [];
  const add = () => onChange(addItem(data, listPath, emptyItem(field.itemType)));
  const remove = (i) => onChange(removeItem(data, listPath, i));
  return (
    <div className="listfld">
      <div className="listfld-head"><span>{field.label}</span><button type="button" onClick={add}>+ adicionar</button></div>
      {items.map((_, i) => (
        <div className="listfld-item" key={i}>
          <div className="listfld-item-head"><small>{field.label} {i + 1}</small><button type="button" className="rm" onClick={() => remove(i)}>× remover</button></div>
          {field.itemFields.map((f, k) => (
            <Field key={k} field={f} data={data} basePath={[...listPath, i]} onChange={onChange} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SectionForm({ section, data, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"acc" + (open ? " open" : "")}>
      <button type="button" className="acc-head" onClick={() => setOpen((o) => !o)}>
        <b>{section.title}</b><i>{open ? "−" : "+"}</i>
      </button>
      {open && (
        <div className="acc-body">
          {section.fields.map((f, i) => (
            <Field key={i} field={f} data={data} basePath={[]} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
