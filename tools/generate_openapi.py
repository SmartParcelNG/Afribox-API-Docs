#!/usr/bin/env python3
"""
Generate OpenAPI 3.1 specs for the Afribox backend from its VB.NET source.

Usage:
    python3 tools/generate_openapi.py [path-to-backend]

Inputs (relative to this repo):
    tools/overrides.json   manual descriptions / examples / manual operations
    tools/i18n/fr.json     French translations (applied to build openapi.fr.json)

Outputs:
    openapi/openapi.json         English spec
    openapi/openapi.fr.json      French spec (English fallback for missing strings)
    tools/endpoint-classification.json   read/write classification for review
"""
import os
import re
import json
import glob
from collections import OrderedDict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(REPO, "tools")
OUT = os.path.join(REPO, "openapi")

API_HOST = "https://afriboxapi.smartparcel.ng/v2"
EXCLUDE_TOP = {"dispatch"}


def find_backend():
    if len(os.sys.argv) > 1:
        return os.path.abspath(os.sys.argv[1])
    # sibling repos: ../Backend API or ../Afribox-Backend
    for cand in ("Backend API", "Afribox-Backend"):
        p = os.path.normpath(os.path.join(REPO, "..", cand))
        if os.path.isdir(os.path.join(p, "v2")):
            return p
    raise SystemExit("Backend path not found; pass it as the first argument.")


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return default


CLASS_RE = re.compile(r"Public\s+Class\s+([A-Za-z0-9_]+)")
PROP_RE = re.compile(
    r"(?:<[^>]*JsonProperty\(\s*\"([A-Za-z0-9_]+)\"\s*\)[^>]*>\s*)?"
    r"Public\s+(?:ReadOnly\s+|WriteOnly\s+)?Property\s+([A-Za-z0-9_]+)(?:\(\))?\s+As\s+"
    r"([A-Za-z0-9_\.]+(?:\(Of[^)]*\))?)"
)
LIST_RE = re.compile(r"List\(Of\s+([A-Za-z0-9_\.]+)\)")
DICT_RE = re.compile(r"Dictionary\(Of\s+([A-Za-z0-9_\.]+)\s*,\s*([A-Za-z0-9_\.]+)\)")

PRIMITIVES = {
    "String": {"type": "string"},
    "Char": {"type": "string"},
    "Integer": {"type": "integer", "format": "int32"},
    "Long": {"type": "integer", "format": "int64"},
    "Short": {"type": "integer", "format": "int32"},
    "Double": {"type": "number", "format": "double"},
    "Single": {"type": "number", "format": "float"},
    "Decimal": {"type": "number", "format": "double"},
    "Boolean": {"type": "boolean"},
    "Date": {"type": "string", "format": "date-time"},
    "DateTime": {"type": "string", "format": "date-time"},
    "Object": {"type": "object"},
}

# ---------------------------------------------------------------- metadata
# Fields served as .NET boolean strings ("True"/"False").
BOOLEAN_PROPS = {
    "parcelpaid", "processed", "customeractive", "isdefault", "deliverypaid",
    "businessactive", "passwordreset", "deliveryrequested", "lockersavailable",
    "sendwebhook", "sendwebhookonsuccess", "sendwebhookonfailure",
    "notificationsent", "notificationread", "verified",
    "courierassigned", "courierdispatchassigned", "boxonline", "boxactive",
    "retrieved", "retrievecompleted", "retrieverequested", "dropcodeused",
    "collectcodeused",
}
# Fields served as server-local strings: M/d/yyyy h:mm:ss AM/PM, no timezone (UTC+1).
DATE_PROPS = {
    "datecreated", "dropdate", "collectdate", "paidat", "expiry", "imagedatetime",
    "datelastping", "dateexpires", "dateactivated", "datelastlogin", "expiresat",
    "retrievedate", "retrievecompletedate", "deliveryrequesteddate",
    "courierassigneddate", "courierdispatchdate", "pickedupdate", "delivereddate",
    "verifieddate", "datecreatedshortdate", "datecreatedshorttime",
    "datecreatedlongdate",
}
EMAIL_PROPS = {
    "email", "emailaddress", "customeremailaddress", "senderemail",
    "recipientemail", "businessemail",
}
STATUSCODE_ENUM = ["00", "01", "02", "03", "04", "05", "06", "07", "08",
                   "09", "10", "11", "98", "99"]
DATE_PATTERN = r"^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4} [0-9]{1,2}:[0-9]{2}:[0-9]{2} (AM|PM)$"

ACTION = {
    "list": "List", "all": "List all", "search": "Find", "available": "List available",
    "info": "Get", "details": "Get", "dashboard": "Get the dashboard",
    "balance": "Get the balance", "transactionhistory": "Get the wallet transactions",
    "create": "Create", "new": "Create", "add": "Add", "signup": "Register",
    "login": "Log in", "cancel": "Cancel", "delete": "Delete", "retrieve": "Retrieve",
    "reserve": "Reserve", "verify": "Verify", "initialize": "Initialize",
    "status": "Get the status of", "success": "Confirm", "hold": "Place a hold on",
    "release": "Release", "drop": "Drop off a parcel at", "collect": "Collect a parcel from",
    "snapshots": "List the snapshots of", "snapshot": "Upload a snapshot for",
    "timeline": "Get the timeline of", "reports": "Report on", "report": "Report on",
    "support": "Submit a support request for", "edit": "Edit",
    "changepassword": "Change the password of", "resetpassword": "Reset the password of",
    "forgotpassword": "Request a password reset for", "otp": "Verify the OTP for",
    "wallettransaction": "Create a wallet transaction", "fees": "Get the fees for",
    "parceltypes": "List the parcel types", "deliveryareas": "List the delivery areas",
    "couriers": "List the couriers", "cities": "List the cities", "states": "List the states",
    "sizes": "List the sizes", "boxes": "List the boxes", "availableboxes": "List the available boxes",
    "cards": "List the saved cards", "ping": "Ping", "setup": "Set up",
    "webhook": "Handle the Paystack webhook",
}


def parse_classes(app_code):
    classes = {}
    for path in glob.glob(os.path.join(app_code, "OBJ_*.vb")):
        txt = open(path, encoding="utf-8", errors="ignore").read()
        marks = [(m.start(), m.group(1)) for m in CLASS_RE.finditer(txt)]
        for i, (start, name) in enumerate(marks):
            end = marks[i + 1][0] if i + 1 < len(marks) else len(txt)
            body = txt[start:end]
            props = []
            seen = set()
            for pm in PROP_RE.finditer(body):
                pname = pm.group(1) or pm.group(2)   # JSON name override, else VB name
                ptype = pm.group(3)
                if pname in seen:
                    continue
                seen.add(pname)
                props.append((pname, ptype))
            if name not in classes:
                classes[name] = props
    return classes


def strip_prefix(name):
    return name[5:] if name.startswith("JSON_") else name


def build_name_map(class_names):
    """full class name -> component name (strip JSON_), de-dup collisions."""
    stripped = {}
    for n in class_names:
        stripped.setdefault(strip_prefix(n), []).append(n)
    name_map = {}
    for n in class_names:
        s = strip_prefix(n)
        name_map[n] = n if len(stripped[s]) > 1 else s
    return name_map


def ref_name(full, name_map):
    return name_map.get(full, strip_prefix(full))


def type_to_schema(vbtype, name_map):
    t = vbtype.strip()
    m = LIST_RE.match(t)
    if m:
        inner = m.group(1)
        return {"type": "array", "items": type_to_schema(inner, name_map)}
    d = DICT_RE.match(t)
    if d:
        return {"type": "object", "additionalProperties": type_to_schema(d.group(2), name_map)}
    base = t.split(".")[-1]
    if base in PRIMITIVES:
        return dict(PRIMITIVES[base])
    # class reference
    return {"$ref": f"#/components/schemas/{ref_name(base, name_map)}"}


def _inner_class(ptype):
    m = LIST_RE.match(ptype.strip())
    if m:
        return m.group(1).split(".")[-1]
    d = DICT_RE.match(ptype.strip())
    if d:
        return d.group(2).split(".")[-1]
    return ptype.strip().split(".")[-1]


def collect_reachable(roots, classes):
    """All classes transitively referenced from roots."""
    seen = OrderedDict()
    stack = list(roots)
    while stack:
        name = stack.pop()
        if name in seen or name not in classes:
            continue
        seen[name] = True
        for _, ptype in classes[name]:
            base = _inner_class(ptype)
            if base not in PRIMITIVES and base in classes:
                stack.append(base)
    return list(seen.keys())


# ---------------------------------------------------------------- endpoints

REQ_RE = re.compile(r"Dim\s+RequestObject\s+As\s+New\s+([A-Za-z0-9_]+)")
RES_RE = re.compile(r"Dim\s+ResponseObject\s+As\s+New\s+([A-Za-z0-9_]+)")


def detect_auth(txt):
    if "ResolvePaystackAuth" in txt:
        return "paystack_dual"
    if "WS_API_Authenticate_Business_APISecretKey" in txt:
        return "business_secret"
    if "Authenticate_Business_APIPublicKey" in txt:
        return "business_public"
    if "Authenticate_APIKey(" in txt:
        return "app_key"
    return "none"


WRITE_HINTS = (
    "/new", "/create", "/add", "/delete", "setdefault", "cancel", "retrieve",
    "edit", "changepassword", "resetpassword", "signup", "login", "otp",
    "forgotpassword", "reserve", "drop", "collect", "initialize", "verify",
    "success", "webhook", "support", "wallettransaction", "hold", "release",
    "snapshot", "setup",
)


def discover_endpoints(backend):
    endpoints = []
    pattern = os.path.join(backend, "v2", "**", "default.aspx")
    for f in sorted(glob.glob(pattern, recursive=True)):
        rel = os.path.relpath(f, os.path.join(backend, "v2"))
        parts = rel.split(os.sep)
        if parts[0] in EXCLUDE_TOP:
            continue
        if parts[-1] != "default.aspx":
            continue
        path = "/" + "/".join(parts[:-1]) + "/"
        txt = open(f, encoding="utf-8", errors="ignore").read()
        method = "get" if 'HttpMethod = "GET"' in txt else "post"
        req = REQ_RE.search(txt)
        res = RES_RE.search(txt)
        endpoints.append({
            "path": path,
            "method": method,
            "tag": parts[0],
            "request": req.group(1) if req else None,
            "response": res.group(1) if res else None,
            "auth": detect_auth(txt),
        })
    return endpoints


def derive_summary(path):
    segs = [s for s in path.strip("/").split("/") if s]
    tag = segs[0] if segs else ""
    rest = segs[1:]
    last = rest[-1] if rest else ""
    obj = " ".join(rest[:-1]) if len(rest) > 1 else tag
    verb = ACTION.get(last)
    if verb:
        return (f"{verb} {obj.replace('-', ' ')}".strip()).strip()
    words = segs[-3:] if len(segs) > 3 else segs
    title = " ".join(words).replace("-", " ")
    return title[:1].upper() + title[1:]


def derive_description(path, tag, method):
    summary = derive_summary(path)
    return (
        f"{summary}. Family: `{tag}`. Authentication and outcome follow the "
        "standard envelope: HTTP 200, with the result in `statuscode` "
        "(`00` = success). A valid request with no results returns `00` with an "
        "empty array (not `99`/`null`)."
    )


def classify_readonly(ep, overrides):
    key = f'{ep["method"].upper()} {ep["path"]}'
    o = overrides.get("operations", {}).get(key, {})
    if "readonly" in o:
        return o["readonly"]
    if ep["method"] == "get":
        return True
    low = ep["path"].lower()
    return not any(h in low for h in WRITE_HINTS)


def build_operation(ep, classes, name_map, overrides):
    key = f'{ep["method"].upper()} {ep["path"]}'
    o = dict(overrides.get("operations", {}).get(key, {}))
    readonly = classify_readonly(ep, overrides)

    op = OrderedDict()
    segs = [s for s in ep["path"].strip("/").split("/") if s]
    op["operationId"] = ep["method"] + "_" + "_".join(segs)
    op["summary"] = o.get("summary") or derive_summary(ep["path"])
    op["tags"] = [ep["tag"]]
    desc = o.get("description") or derive_description(ep["path"], ep["tag"], ep["method"])
    op["description"] = desc
    op["x-auth"] = ep["auth"]
    op["x-readonly"] = bool(readonly)
    if o.get("deprecated"):
        op["deprecated"] = True

    if ep["method"] == "post" and ep["request"]:
        media = {"schema": {"$ref": f'#/components/schemas/{ref_name(ep["request"], name_map)}'}}
        if o.get("example") is not None:
            media["example"] = o["example"]
        op["requestBody"] = {"required": True, "content": {"application/json": media}}

    resp_schema = None
    if ep["response"]:
        resp_schema = {"$ref": f'#/components/schemas/{ref_name(ep["response"], name_map)}'}
    resp200 = OrderedDict()
    resp200["description"] = (
        "Result envelope (`statuscode`/`statusmessage`). `00` = success; a valid request "
        "with no results is `00` with an empty array (not `99`/`null`). Any other "
        "`statuscode` (e.g. `04`, `98`, `99`) indicates a failure."
    )
    if resp_schema:
        media = OrderedDict([("schema", resp_schema)])
        if o.get("responseExample") is not None:
            media["example"] = o["responseExample"]
        resp200["content"] = {"application/json": media}
    elif o.get("responseExample") is not None:
        resp200["content"] = {"application/json": {"example": o["responseExample"]}}

    op["responses"] = OrderedDict([
        ("200", resp200),
        ("404", {"description": "Unknown path — returns the JSON envelope with `statuscode` `99`, not an HTML page."}),
        ("500", {"description": "Unexpected server error — returns the JSON envelope with `statuscode` `99`, not an ASP.NET page."}),
    ])
    return op


def apply_i18n(spec, fr):
    """Return a French copy of spec with fr.json strings applied."""
    import copy
    out = copy.deepcopy(spec)
    templates = fr.get("templates", {})
    auth_labels = fr.get("authLabels", {})
    if "info" in fr:
        for k, v in fr["info"].items():
            if v:
                out["info"][k] = v
    for tag in out.get("tags", []):
        tv = fr.get("tags", {}).get(tag["name"])
        if tv:
            tag["description"] = tv
    for path, methods in out.get("paths", {}).items():
        for method, op in methods.items():
            oid = op.get("operationId")
            t = fr.get("operations", {}).get(oid, {})
            if t.get("summary"):
                op["summary"] = t["summary"]
            if t.get("description"):
                op["description"] = t["description"]
            elif templates.get("operationDescription") and (
                "Family: `" in (op.get("description") or "")
                or (op.get("description") or "").startswith("Authentication:")
            ):
                auth = op.get("x-auth", "")
                label = auth_labels.get(auth, auth)
                op["description"] = templates["operationDescription"].replace("{auth}", label)
            if (templates.get("response200") and "200" in op.get("responses", {})
                    and (op["responses"]["200"].get("description") or "").startswith("Result envelope")):
                op["responses"]["200"]["description"] = templates["response200"]
    for sname, schema in out.get("components", {}).get("schemas", {}).items():
        t = fr.get("schemas", {}).get(sname, {})
        if t.get("description"):
            schema["description"] = t["description"]
        for pname, pv in (t.get("properties") or {}).items():
            if pv and "properties" in schema and pname in schema["properties"]:
                schema["properties"][pname]["description"] = pv
    return out


def disambiguate_summaries(paths, tag_labels):
    """Sidebar labels are translation keys; ensure summaries are unique."""
    from collections import Counter
    counts = Counter(op.get("summary", "") for methods in paths.values() for op in methods.values())
    for methods in paths.values():
        for op in methods.values():
            s = op.get("summary", "")
            if counts[s] > 1:
                tag = (op.get("tags") or ["api"])[0]
                op["summary"] = f"{tag_labels.get(tag, tag)}: {s}"
    # Second pass for any remaining collisions (rare)
    counts2 = Counter(op.get("summary", "") for methods in paths.values() for op in methods.values())
    for path, methods in paths.items():
        for op in methods.values():
            s = op.get("summary", "")
            if counts2[s] > 1:
                op["summary"] = f'{s} ({path.strip("/")})'


def main():
    backend = find_backend()
    overrides = load_json(os.path.join(TOOLS, "overrides.json"), {})
    fr = load_json(os.path.join(TOOLS, "i18n", "fr.json"), {})

    classes = parse_classes(os.path.join(backend, "App_Code"))
    endpoints = discover_endpoints(backend)
    name_map = build_name_map(classes.keys())

    roots = [c for ep in endpoints for c in (ep["request"], ep["response"]) if c]
    reachable = collect_reachable(roots, classes)

    schemas = OrderedDict()
    ov_schemas = overrides.get("schemas", {})
    ov_props = overrides.get("propertyTypes", {})
    for cname in reachable:
        props = OrderedDict()
        for pname, ptype in classes[cname]:
            props[pname] = type_to_schema(ptype, name_map)
        sname = ref_name(cname, name_map)
        schema_ov = ov_schemas.get(sname, {})
        for pname, ps in props.items():
            low = pname.lower()
            if ps.get("type") == "string":
                if low in BOOLEAN_PROPS:
                    ps.setdefault("enum", ["True", "False"])
                    ps.setdefault("description", 'Boolean serialized by the server as the string "True" or "False".')
                if low in DATE_PROPS:
                    ps.setdefault("pattern", DATE_PATTERN)
                    ps.setdefault("description", "Date/time as served: M/d/yyyy h:mm:ss AM/PM, no timezone (server is UTC+1).")
                if low in EMAIL_PROPS:
                    ps.setdefault("format", "email")
                if low == "statuscode":
                    ps.setdefault("enum", STATUSCODE_ENUM)
                    ps.setdefault("description", "Result code: 00 success; 01-03 request body; 04 missing field; 05-11 validation; 98 authentication; 99 generic error or empty result.")
            for k, v in (ov_props.get(pname) or {}).items():
                ps[k] = v
            for k, v in ((schema_ov.get("properties") or {}).get(pname) or {}).items():
                ps[k] = v
        schema = OrderedDict()
        schema["type"] = "object"
        schema["properties"] = props
        req = list(schema_ov.get("required", []))
        if "apikey" in props and "apikey" not in req:
            req.insert(0, "apikey")
        if req:
            schema["required"] = req
        if schema_ov.get("example") is not None:
            schema["example"] = schema_ov["example"]
        if schema_ov.get("description"):
            schema["description"] = schema_ov["description"]
        schemas[sname] = schema

    # tag order
    tag_order = ["core", "customer", "business", "kiosk", "pay", "parcel", "admin"]
    present_tags = []
    for ep in endpoints:
        if ep["tag"] not in present_tags:
            present_tags.append(ep["tag"])
    present_tags.sort(key=lambda t: tag_order.index(t) if t in tag_order else 99)

    info = overrides.get("info") or {
        "title": "Afribox API",
        "version": "2.0.0",
        "description": "Afribox backend API (SmartParcel). Response envelope: HTTP 200 with `statuscode`/`statusmessage`.",
    }

    paths = OrderedDict()
    excluded = set(overrides.get("excludeEndpoints", []))
    for ep in endpoints:
        if ep["path"] in excluded:
            continue
        paths.setdefault(ep["path"], OrderedDict())[ep["method"]] = build_operation(
            ep, classes, name_map, overrides
        )

    # manual operations (edge endpoints)
    for path, methods in overrides.get("manualOperations", {}).items():
        for method, op in methods.items():
            paths.setdefault(path, OrderedDict())[method] = op

    spec = OrderedDict()
    spec["openapi"] = "3.1.0"
    spec["info"] = info
    spec["servers"] = [{"url": API_HOST, "description": "Afribox production (v2)"}]
    spec["tags"] = [
        {"name": t, "description": (overrides.get("tags", {}).get(t) or f"{t.capitalize()} endpoints")}
        for t in present_tags
    ]
    spec["paths"] = paths
    spec["components"] = {"schemas": schemas}

    disambiguate_summaries(spec["paths"], {t: t.capitalize() for t in present_tags})

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "openapi.json"), "w", encoding="utf-8") as fh:
        json.dump(spec, fh, indent=2, ensure_ascii=False)

    spec_fr = apply_i18n(spec, fr)
    disambiguate_summaries(spec_fr["paths"], fr.get("tagLabels", {}))
    with open(os.path.join(OUT, "openapi.fr.json"), "w", encoding="utf-8") as fh:
        json.dump(spec_fr, fh, indent=2, ensure_ascii=False)

    # Split specs: read (interactive "Try it") vs write (reference only)
    def split(base, prefix):
        for kind, predicate in (("read", True), ("write", False)):
            sub = dict(base)
            sub["paths"] = OrderedDict(
                (p, OrderedDict((m, op) for m, op in methods.items() if bool(op.get("x-readonly")) == predicate))
                for p, methods in base["paths"].items()
                if any(bool(op.get("x-readonly")) == predicate for op in methods.values())
            )
            used_tags = []
            for methods in sub["paths"].values():
                for op in methods.values():
                    for t in op.get("tags", []):
                        if t not in used_tags:
                            used_tags.append(t)
            sub["tags"] = [t for t in base["tags"] if t["name"] in used_tags]
            with open(os.path.join(OUT, f"{prefix}{kind}.json"), "w", encoding="utf-8") as fh:
                json.dump(sub, fh, indent=2, ensure_ascii=False)

    split(spec, "openapi.")
    split(spec_fr, "openapi.fr.")

    # Publish the spec at a stable, versioned address (served from static/).
    import shutil
    static_dir = os.path.join(REPO, "static")
    os.makedirs(static_dir, exist_ok=True)
    shutil.copyfile(os.path.join(OUT, "openapi.json"), os.path.join(static_dir, "openapi.json"))
    version = str(info.get("version", "0"))
    shutil.copyfile(os.path.join(OUT, "openapi.json"), os.path.join(static_dir, f"openapi-{version}.json"))

    classification = [
        {
            "method": ep["method"].upper(),
            "path": ep["path"],
            "tag": ep["tag"],
            "auth": ep["auth"],
            "readonly": classify_readonly(ep, overrides),
            "request": ep["request"],
            "response": ep["response"],
        }
        for ep in endpoints
    ]
    with open(os.path.join(TOOLS, "endpoint-classification.json"), "w", encoding="utf-8") as fh:
        json.dump(classification, fh, indent=2, ensure_ascii=False)

    warns = [c for c in roots if c and c not in classes]
    print(f"backend: {backend}")
    print(f"endpoints: {len(endpoints)}  paths: {len(paths)}  schemas: {len(schemas)}")
    print(f"read-only: {sum(1 for c in classification if c['readonly'])}  write: {sum(1 for c in classification if not c['readonly'])}")
    if warns:
        print(f"WARNING: referenced classes not found: {sorted(set(warns))}")


if __name__ == "__main__":
    main()
