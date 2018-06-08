let indexed = 0;

let re = null;
const words = (q) => {
	if(!re) {
		re = new RegExp("[^" + letters + digits + "]", "g");
	}
	return q.split(re).map(x => { return x.toLowerCase(); })
		.filter(x => { return x.trim() != ""; });
}

const find = () => {
	let q = document.querySelector("#search input[type=text]").value;
	let tokens = words(q);
	let e = document.querySelector("#results");
	let cgrouped = {};
	let count = 0;
	let all = document.querySelector("#all").checked;
	for(let i = 0; i < tokens.length; i++) {
		let t = tokens[i];
		if(!(t in search_index)) {
			continue;
		}
		let result = search_index[t];
		for(let sid in result) {
			let info = result[sid];
			if(all && !tokens.every(x => { return search_index[x] && (sid in search_index[x]); })) {
				continue;
			}
			let r = {
				"channel": chan_sc[info[0]],
				"page": info[1],
				"id": sid
			};
			if(!(r.channel in cgrouped)) {
				cgrouped[r.channel] = [];
			}
			cgrouped[r.channel].push(r);
			count++;
		}
		if(all) {
			break;
		}
	}
	let h = `<div>${count} messages for <i>${s(q)}</i>.</div>`;
	for(let c in cgrouped) {
		let chan = channels[c];
		let name = channels[c].name;
		for(let i = 0; i < cgrouped[c].length; i++) {
			let m = cgrouped[c][i];
			h += `<div><a href="${s(m.channel)}-${s(m.page)}.html#search!${s(m.id)}" target="_blank">Message #${s(m.id)} in ${s(name)} on page ${s((m.page + 1))}</a></div>`;
		}
	}
	e.innerHTML = h;
}

var search_index = {};
var indexes_loaded = 0;
const performSearch = (e) => {
	e.preventDefault();
	if(indexed == 0) {
		[...document.querySelectorAll("#search input")].forEach(x => { x.disabled = true; });
		indexed = 1;
		for(let i = 0; i < idx_count; i++) {
			let script = document.createElement("script");
			script.src = "search-" + i + ".js";
			script.onload = () => {
				if(++indexes_loaded < idx_count) {
					return;
				}
				indexed = 2;
				[...document.querySelectorAll("#search input")].forEach(x => { x.disabled = false; });
				document.querySelector("#search .warning").style.display = "none";
				find();
			}
			document.body.appendChild(script);
		}
	} else {
		find();
	}
	return false;
}

window.addEventListener("load", () => {
	let h = `<ul>`;
	let chans = Object.values(channels);
	chans.sort((a, b) => { return a.position - b.position;});
	for(let i = 0; i < chans.length; i++) {
		let chan = chans[i];
		h += `<li>`;
		if(chan.messages > 0) {
			h += `<a href="${s(chan.id)}-0.html">#${s(chan.name)}</a>`;
		} else {
			h += s(chan.name);
		}
		h += ` (${s(chan.messages + " \uD83D\uDCAC")})</li>`
	}
	h += `</ul>`;
	document.querySelector("#channels").innerHTML = h;
	if(zip && window.location.protocol.match(/^https?:?\/?\/?/)) {
		document.querySelector("#download").style.display = "block";
	}
	if(search) {
		document.querySelector("#search").style.display = "block";
		document.querySelector("#search form").addEventListener("submit", performSearch);
	}
});
