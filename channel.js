const linkify = inputText => {
	let replacePattern1 = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	return inputText.replace(replacePattern1, '<a href="$1" target="&#95;blank">$1</a>');
}

const mdesc = t => {
	return t.replace(/h/g, "&#104;").replace(/\*/g, "&#42;").replace(/_/g, "&#95;").replace(/~/g, "&#126;");
}

const rs = "(\\s|^|[^" + letters + digits + "])";
const re = "(\\s|$|[^" + letters + digits + "])";
const r0 = new RegExp("&lt;([a-zA-Z0-9]+://\\S*)&gt;", "g");
const r1 = new RegExp(rs + "```((?:.|\n)*?)```" + re, "g");
const r2 = new RegExp(rs + "`((?:.|\n)*?)`" + re, "g");
const r3 = new RegExp(rs + "\\*\\*((?:.|\n)*?)\\*\\*" + re, "g");
const r4 = new RegExp(rs + "__((?:.|\n)*?)__" + re, "g");
const r5 = new RegExp(rs + "~~((?:.|\n)*?)~~" + re, "g");
const r6 = new RegExp(rs + "\\*((?:.|\n)*?)\\*" + re, "g");
const r7 = new RegExp(rs + "_((?:.|\n)*?)_" + re, "g");
const r8 = new RegExp("&lt;:[a-zA-Z0-9]+:([0-9]+)&gt;", "g");

const md = t => {
	let result = t.replace(r1, (a, b, c, d) => {
		return b + "<pre>" + mdesc(c) + "</pre>" + d;
	}).replace(r2, (a, b, c, d) => {
		return b + '<span class="t">' + mdesc(c) + "</span>" + d;
	});
	result = result.replace(r0, (a, b) => {
		return '<a href="' + mdesc(b) + '" target="&#95;blank">' + mdesc(b) + '</a>';
	});
	result = result.replace(r8, (a, b) => {
		return '<img src="' + mdesc( 'https://cdn.discordapp.com/emojis/' + b + '.png?v=1') + '" class="emoji" />';
	});
	result = linkify(result);
	result = result.replace(r3, (a, b, c, d) => {
		return b + '<span class="b">' + c + "</span>" + d;
	}).replace(r4, (a, b, c, d) => {
		return b + '<span class="u">' + c + "</span>" + d;
	}).replace(r5, (a, b, c, d) => {
		return b + '<span class="s">' + c + "</span>" + d;
	}).replace(r6, (a, b, c, d) => {
		return b + '<span class="i">' + c + "</span>" + d;
	}).replace(r7, (a, b, c, d) => {
		return b + '<span class="i">' + c + "</span>" + d;
	});
	return result;
}

const rmentions = text => {
	return text.replace(/&lt;@&amp;([0-9]+)&gt;/g, (x, y) => {
		if(y in roles) {
			let r = parseInt(roles[y].color[0]);
			let g = parseInt(roles[y].color[1]);
			let b = parseInt(roles[y].color[2]);
			return `<a href="javascript:void(0);" style="color: rgb(${r}, ${g}, ${b});">@${roles[y].name}</a>`;
		} else {
			
		}
	}).replace(/&lt;#([0-9]+)&gt;/g, (a, b) => {
		return '<a href="' + b + '-0.html">#' + s(b in channels ? channels[b].name : '?') + '</a>';
	});
}

const mentionUser = id => {
	[...document.querySelectorAll('[data-msg-user]')].forEach(x => {
		x.style.backgroundColor = "inherit";
	});
	[...document.querySelectorAll('[data-msg-user="' + id + '"]')].forEach(x => {
		x.style.backgroundColor = "yellow";
	});
}

const umentions = (content, mentions) => {
	for(let i = 0; i < mentions.length; i++) {
		let member = members[mentions[i]];
		content = content.replace(new RegExp("&lt;@" + member.id + "&gt;", "g"),
				`<a href="javascript:mentionUser('${member.id}');" style="${member.color ? 'color: rgb(' + member.color.join(',') + ');' : ''}">@${s(member.name||member.username)}#${s(member.discriminator)}</a>`);
	}
	return content;
}

const renderMessages = (elm) => {
	let html = '<table class="messages">';
	for(let i = 0; i < channel.length; i++) {
		let m = channel[i];
		let h = '';
		let date = new Date(m.timestamp).toString();
		let edited = m.edited_timestamp ? new Date(m.edited_timestamp).toString() : null;
		let author = members[m.author];
		author.name = author.name || author.username;
		h += `<tr data-msg-user="${s(author.id)}">
			<td>${author.avatar ? `<img data-src="https://cdn.discordapp.com/avatars/${s(author.id)}/${s(author.avatar)}?size=64" class="avatar" />` : `<img data-src="https://cdn.discordapp.com/embed/avatars/${author.discriminator % 5}.png" class="avatar" />`}</td>
			<td data-msg-sid="${s(m.s)}" data-msg-id="${s(m.id)}">
			<div class="author">
			<a href="javascript:mentionUser('${s(author.id)}');" class="name" style="${author.color ? 'color: rgb(' + author.color.join(',') + ');' : ''}">${s(author.name + "#" + author.discriminator)}</a> <span class="date">${s(date)}</span>
			${edited ? ` <span class="edited">(edited ${s(edited)})</span>` : '' }
			<a class="id" href="#msg!${s(m.id)}" onclick="scrollToMessage('${s(m.id)}');">#${s(m.s)}</a></div>
			<div class="content">${md(umentions(rmentions(s(m.content)), m.mentions))}</div>
			<div class="attachments">`;
		for(let j = 0; m.attachments && j < m.attachments.length; j++) {
			let att = m.attachments[j];
			if(att.width && att.height && att.proxy_url && att.url) {
				let nwidth = parseInt(att.width);
				let nheight = parseInt(att.height);
				if(att.width > 400) {
					nwidth = 400;
					nheight = parseInt(nheight / (att.width / nwidth));
					att.height = nheight;
				}
				if(att.height > 300) {
					nheight = 300;
					nwidth = parseInt(nwidth / (att.height / nheight));
				}
				h += `<a href="${s(att.url)}" target="&#95;blank"><img style="width: ${nwidth}px; height: ${nheight}px;" data-src="${s(att.proxy_url)}?width=${nwidth}&height=${nheight}" /></a>`;
			} else if(att.url) {
				h += `<a href="${s(att.url)}">${s(att.url)}</a><br />`;
			} else {
				h += `<pre>${s(JSON.stringify(att))}</pre>`;
			}
		}
		h += `</div><div class="embeds">`;
		for(let j = 0; m.embeds && j < m.embeds.length; j++) {
			let att = m.embeds[j];
			if(att.url) {
				h += `<a href="${s(att.url)}">${s(att.url)}</a><br />`;
			} else {
				h += `<pre>${s(JSON.stringify(att))}</pre>`;
			}
		}
		h += `</div><div class="reactions">`;
		for(let j = 0; m.reactions && j < m.reactions.length; j++) {
			let reaction = m.reactions[j];
			h += `<span class="reaction">`;
			if(reaction.emoji) {
				h += `<span class="emoji">${reaction.emoji.url ? `<img src="${s(reaction.emoji.url)}" title="${s(reaction.emoji.name)}" alt="${s(reaction.emoji.name)}" />` : s(reaction.emoji.name)}</span>`;
			}
			h += ` <span class="count">${s(reaction.count)}</span>
			</span>`;
		}
		h += `</div>
			</td>
			</tr>`;
		html += h;
	}
	html += '</table>';
	elm.innerHTML = html;
}
const remove = elm => {
	elm.parentElement.removeChild(elm);
}

const visible = elm => {
	let b = elm.getBoundingClientRect();
	return b.top + b.height > 0 && b.top < Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

const loadVisibleImages = (all) => {
	let imgs = document.querySelectorAll("img[data-src]");
	for(let i = 0; i < imgs.length; i++) {
		let img = imgs[i];
		let src = img.getAttribute("data-src");
		if(visible(img) || all === true) {
			img.src = src;
			img.removeAttribute("data-src");
		}
	}
}

const scrollToMessage = id => {
	let element = document.querySelector('[data-msg-id="' + id + '"]');
	if(element) {
		element.scrollIntoView();
	}
}

window.addEventListener("load", () => {
	document.querySelector("h1").textContent = document.title = "#" + channels[channel_id].name;
	let page = parseInt(document.querySelector("#page").textContent) - 1;
	let pages = parseInt(document.querySelector("#pages").textContent);
	document.querySelector("#next").href = channel_id + "-" + (page + 1) + ".html";
	document.querySelector("#prev").href = channel_id + "-" + (page - 1) + ".html";
	if(page == 0) {
		remove(document.querySelector("#prev"));
		remove(document.querySelector("#prevsep"));
	}
	if(page == pages - 1) {
		remove(document.querySelector("#next"));
		remove(document.querySelector("#nextsep"));
	}
	renderMessages(document.querySelector("#container"));
	loadVisibleImages();
	window.addEventListener("scroll", loadVisibleImages);
	let hash = document.location.hash || "#";
	if(!hash.startsWith("#")) {
		hash = "#" + hash;
	}
	let search = hash.match(/^#?search!([0-9]+)$/);
	if(search) {
		let element = document.querySelector('[data-msg-sid="' + search[1] + '"]');
		if(element) {
			document.location = "#msg!" + element.getAttribute("data-msg-id");
			element.scrollIntoView();
		}
	}
	let match = hash.match(/^#?msg!([0-9]+)$/);
	if(match) {
		scrollToMessage(match[1]);
	}
});
