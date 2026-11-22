"use client";
// Father's and mother's name: at least one is required, not both (single
// parents and guardians are common). Each field is `required` only while
// the other is empty, so the browser's own validation enforces the rule
// before the form is sent and nothing typed elsewhere is lost.
import { useState } from "react";

export function ParentFields({ inputClass, labelClass }: { inputClass: string; labelClass: string }) {
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const neither = !father.trim() && !mother.trim();

  return (
    <div className="space-y-2">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="father_name">
            Father&rsquo;s name
          </label>
          <input
            id="father_name"
            name="father_name"
            autoComplete="off"
            required={neither}
            value={father}
            onChange={(e) => setFather(e.target.value)}
            aria-describedby="parents-hint"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="mother_name">
            Mother&rsquo;s name
          </label>
          <input
            id="mother_name"
            name="mother_name"
            autoComplete="off"
            required={neither}
            value={mother}
            onChange={(e) => setMother(e.target.value)}
            aria-describedby="parents-hint"
            className={inputClass}
          />
        </div>
      </div>
      <p id="parents-hint" className="text-xs text-gray-500">
        Enter at least one parent or guardian.
      </p>
    </div>
  );
}
