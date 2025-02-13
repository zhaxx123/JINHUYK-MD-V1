const {
   updateProfilePicture,
   parsedJid
 } = require("../lib");
 const {
   sck,
   smd,
   send,
   Config,
   tlang,
   sleep,
   getAdmin,
   prefix
 } = require("../lib");
 const astro_patch = require("../lib/plugins");
 const {
   cmd
 } = astro_patch;
 const grouppattern = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/g;
 smd({
   cmdname: "join",
   info: "joins group by link",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<group link.>"
 }, async (_0x466dd8, _0x5b1338) => {
   try {
     if (_0x466dd8.reply_message && _0x466dd8.reply_message.groupInvite) {
       var _0x29e5fc = await _0x466dd8.bot.groupAcceptInviteV4(_0x466dd8.chat, _0x466dd8.reply_message.msg);
       if (_0x29e5fc && _0x29e5fc.includes("joined to:")) {
         return await send(_0x466dd8, "*_Joined_*", {}, "", _0x466dd8);
       }
     }
     let _0x208739 = _0x5b1338 ? _0x5b1338 : _0x466dd8.reply_text;
     const _0x47ed60 = _0x208739.match(grouppattern);
     if (!_0x47ed60) {
       return await _0x466dd8.reply("*_Uhh Please, provide group link_*");
     }
     let _0x4263be = _0x47ed60[0].split("https://chat.whatsapp.com/")[1].trim();
     await _0x466dd8.bot.groupAcceptInvite(_0x4263be).then(_0x7f3222 => send(_0x466dd8, "*_Joined_*", {}, "", _0x466dd8)).catch(_0x1d6aea => _0x466dd8.send("*_Can't Join, Group Id not found!!_*"));
   } catch (_0x5d3484) {
     await _0x466dd8.error(_0x5d3484 + "\n\ncommand: join", _0x5d3484, "*_Can't Join, Group Id not found, Sorry!!_*");
   }
 });
smd({
   cmdname: "leave",
   info: "Leave the current group",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: ""
}, async (message) => {
   try {
       if (!message.isGroup) {
           return await message.reply("*_This command can only be used in groups!!_*");
       }
       await message.bot.groupLeave(message.chat);
       await send(message, "*_I have left the group_*", {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: leave", error, "*_Failed to leave the group_*");
   }
});
smd({
   cmdname: "promote",
   info: "Promote a member to admin",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<@user>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !message.mentionedJid[0]) return await message.reply("*_Mention a user to promote_*");
       
       let user = message.mentionedJid[0];
       await message.bot.groupMakeAdmin(message.chat, [user]);
       await send(message, `*_Promoted @${user.split("@")[0]} to admin_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: promote", error, "*_Failed to promote user_*");
   }
});
smd({
   cmdname: "demote",
   info: "Demote an admin to member",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<@user>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !message.mentionedJid[0]) return await message.reply("*_Mention a user to demote_*");

       let user = message.mentionedJid[0];
       await message.bot.groupDemoteAdmin(message.chat, [user]);
       await send(message, `*_Demoted @${user.split("@")[0]} to member_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: demote", error, "*_Failed to demote user_*");
   }
});
smd({
   cmdname: "tagall",
   info: "Mention all group members",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: ""
}, async (message) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");

       let groupMetadata = await message.bot.groupMetadata(message.chat);
       let members = groupMetadata.participants.map(user => `@${user.id.split("@")[0]}`).join("\n");

       await send(message, `*Tagging All Members:*\n${members}`, { mentions: groupMetadata.participants.map(p => p.id) }, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: tagall", error, "*_Failed to tag all_*");
   }
});
  smd({
   cmdname: "kick",
   info: "Remove a member from the group",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<@user>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !message.mentionedJid[0]) return await message.reply("*_Mention a user to kick_*");
       
       let user = message.mentionedJid[0];
       await message.bot.groupParticipantsUpdate(message.chat, [user], "remove");
       await send(message, `*_Removed @${user.split("@")[0]} from the group_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: kick", error, "*_Failed to remove user_*");
   }
});
smd({
   cmdname: "kickall",
   info: "Remove all non-admin members",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: ""
}, async (message) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");

       let groupMetadata = await message.bot.groupMetadata(message.chat);
       let admins = groupMetadata.participants.filter(user => user.admin);
       let members = groupMetadata.participants.filter(user => !user.admin).map(user => user.id);

       if (members.length === 0) return await message.reply("*_No members to kick_*");
       
       await message.bot.groupParticipantsUpdate(message.chat, members, "remove");
       await send(message, "*_All non-admins have been removed_*", {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: kickall", error, "*_Failed to remove all members_*");
   }
});
smd({
   cmdname: "antilien",
   info: "Prevent members from sending links",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: antilien <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.antilink[message.chat] = state;
       await send(message, `*_Antilink is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: antilien", error, "*_Failed to update antilink_*");
   }
});
smd({
   cmdname: "antitag",
   info: "Prevent members from using @all",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: antitag <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.antitag[message.chat] = state;
       await send(message, `*_Antitag is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: antitag", error, "*_Failed to update antitag_*");
   }
});
smd({
   cmdname: "antipromote",
   info: "Prevent members from being promoted",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: antipromote <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.antipromote[message.chat] = state;
       await send(message, `*_Antipromote is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: antipromote", error, "*_Failed to update antipromote_*");
   }
});
smd({
   cmdname: "antidemote",
   info: "Prevent admins from being demoted",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: antidemote <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.antidemote[message.chat] = state;
       await send(message, `*_Antidemote is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: antidemote", error, "*_Failed to update antidemote_*");
   }
});

smd({
   cmdname: "info",
   info: "Get information about the group",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: ""
}, async (message) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       
       let groupMetadata = await message.bot.groupMetadata(message.chat);
       let groupInfo = `*Group Name:* ${groupMetadata.subject}\n` +
                       `*Group ID:* ${message.chat}\n` +
                       `*Owner:* @${groupMetadata.owner.split("@")[0]}\n` +
                       `*Members:* ${groupMetadata.participants.length}`;
       
       await send(message, groupInfo, { mentions: [groupMetadata.owner] }, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: groupinfo", error, "*_Failed to get group info_*");
   }
});
smd({
   cmdname: "welcome",
   info: "Enable or disable the welcome message for new members",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: welcome <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.welcome[message.chat] = state;
       await send(message, `*_Welcome message is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: welcome", error, "*_Failed to update welcome settings_*");
   }
});
smd({
   cmdname: "goodbye",
   info: "Enable or disable the goodbye message for members leaving the group",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<on/off>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");
       if (!text || !["on", "off"].includes(text.toLowerCase())) return await message.reply("*_Use: goodbye <on/off>_*");

       let state = text.toLowerCase() === "on";
       message.bot.goodbye[message.chat] = state;
       await send(message, `*_Goodbye message is now ${state ? "Enabled" : "Disabled"}_*`, {}, "", message);
   } catch (error) {
       await message.error(error + "\n\ncommand: goodbye", error, "*_Failed to update goodbye settings_*");
   }
});
smd({
   cmdname: "clear",
   info: "Clear a specified number of messages in the group",
   type: "whatsapp",
   fromMe: true,
   filename: __filename,
   use: "<number_of_messages>"
}, async (message, text) => {
   try {
       if (!message.isGroup) return await message.reply("*_This command can only be used in groups!!_*");

       const numberOfMessages = parseInt(text);
       if (isNaN(numberOfMessages) || numberOfMessages <= 0) return await message.reply("*_Please specify a valid number of messages to delete (e.g., clear 5)_*");

       const messages = await message.fetchMessages({ limit: numberOfMessages + 1 });
       await message.deleteMessages(messages);
       await message.reply(`*${numberOfMessages} messages have been deleted successfully.*`);
   } catch (error) {
       await message.error(error + "\n\ncommand: clear", error, "*_Failed to clear messages_*");
   }
});

