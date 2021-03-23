const express = require('express');
const Evernote = require('evernote');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const customCommand = require('./app/customCommand');

var commandText = undefined;

const DEFAULT_PORT = 3000;

//initialize express.
const app = express();

var customCommands = [];

fs.readFile("custom-commands.conf", "utf-8", (err, data) => {
   if (!err) {
      customCommands = JSON.parse(data);
   } else {
      console.log(err);
   }
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
const { S_IFBLK } = require('constants');
app.use(cookieParser());

// Set the front-end folder to serve public assets.
app.use("/lib", express.static(path.join(__dirname, "../../lib/msal-browser/lib")));

// Setup app folders
app.use(express.static('app'));
var hbs = exphbs.create({
   helpers: {
      ifEquals: function (arg1, arg2) {
         if (arg1 == arg2) {
            return true;
         } else {
            return undefined;
         }
      }
   }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Set up a route for index.html.
app.get('/', function (req, res) {
   res.render('index', { customCommands: customCommands });
});

app.get('/evernote', function (req, res) {
   var userToken = req.cookies.userToken;
   if (userToken === undefined) {
      var callbackUrl = "http://localhost:3000/evernote/oauth";
      var client = new Evernote.Client({
         consumerKey: 'stokic16',
         consumerSecret: '106bb4375e8f0a69',
         sandbox: true,
         china: false,
      });
      client.getRequestToken(callbackUrl, function (error, oauthToken, oauthTokenSecret) {
         if (error) {
            console.log(error);
         } else {
            global.oauthToken = oauthToken;
            global.oauthTokenSecret = oauthTokenSecret;
            var authorizeUrl = client.getAuthorizeUrl(oauthToken);
            res.render('evernote', {
               authorizeUrl: authorizeUrl
            });
         }
      });
   } else {
      authenticatedClient = new Evernote.Client({
         token: userToken,
         sandbox: true,
         china: false,
      });
      var noteStore = authenticatedClient.getNoteStore();
      noteStore.listNotebooks().then(function (notebooks) {
         var guid = req.query.guid;
         var message = req.query.message;
         if (guid === undefined) {
            noteStore.findNotesMetadata(new Evernote.NoteStore.NoteFilter(), 0, 50, new Evernote.NoteStore.NotesMetadataResultSpec({ includeTitle: true, includeNotebookGuid: true })).then(function (notes) {
               var outputNotebooks = [];
               notebooks.forEach(notebook => {
                  notebook.notes = [];
                  notes.notes.forEach(note => {
                     if (note.notebookGuid == notebook.guid) {
                        notebook.notes.push(note);
                     }
                  });
                  outputNotebooks.push(notebook);
               });
               res.render('evernote', {
                  loggedIn: true,
                  notebooks: outputNotebooks,
                  message: message,
                  customCommands: customCommands,
                  customCommandText: commandText
               });
               commandText = undefined;
            });
         } else {
            noteStore.findNotesMetadata(new Evernote.NoteStore.NoteFilter(), 0, 50, new Evernote.NoteStore.NotesMetadataResultSpec({ includeTitle: true, includeNotebookGuid: true })).then(function (notes) {
               var outputNotebooks = [];
               var activeNotebook;
               notebooks.forEach(notebook => {
                  if (notebook.guid == guid) {
                     activeNotebook = notebook;
                     activeNotebook.notes = [];
                     notes.notes.forEach(note => {
                        if (note.notebookGuid == notebook.guid) {
                           activeNotebook.notes.push(note);
                        }
                     });
                  } else {
                     notebook.notes = [];
                     notes.notes.forEach(note => {
                        if (note.notebookGuid == notebook.guid) {
                           notebook.notes.push(note);
                        }
                     });
                     outputNotebooks.push(notebook);
                  }
               });
               res.render('evernote', {
                  loggedIn: true,
                  notebooks: outputNotebooks,
                  activeNotebook,
                  message: message,
                  customCommands: customCommands,
                  customCommandText: commandText
               });
               commandText = undefined;
            });

         }

      });
   }
});

app.get('/evernote/create/notebook', function (req, res) {
   var notebookTitle = req.query.title;
   var authenticatedClient = new Evernote.Client({
      token: req.cookies.userToken,
      sandbox: true,
      china: false,
   });
   var noteStore = authenticatedClient.getNoteStore();
   noteStore.createNotebook(new Evernote.Types.Notebook({ name: notebookTitle })).then(function () {
      res.redirect("/evernote?" + "&message=New Notebook created!");
   });
});

app.post('/evernote/create/note', function (req, res) {
   var noteTitle = req.query.title;
   var authenticatedClient = new Evernote.Client({
      token: req.cookies.userToken,
      sandbox: true,
      china: false,
   });
   var noteStore = authenticatedClient.getNoteStore();
   noteStore.createNote(new Evernote.Types.Note({ notebookGuid: req.body.guid, title: noteTitle, content: req.body.content })).then(function () {
      res.redirect("/evernote?guid=" + req.body.guid + "&message=New Note created!");
   }).catch(function (error) {
      console.log(error);
   });
});

app.post('/evernote/update/note', function (req, res) {
   var authenticatedClient = new Evernote.Client({
      token: req.cookies.userToken,
      sandbox: true,
      china: false,
   });
   var noteStore = authenticatedClient.getNoteStore();
   noteStore.getNoteWithResultSpec(req.body.guid, new Evernote.NoteStore.NoteResultSpec({ includeContent: true })).then(function (note) {
      console.log(note.content.split("<en-note>")[1].split("</en-note>"));
      var temp = note.content.split("<en-note>")[1].split("</en-note>")[0] + '<p>' + req.body.content.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br></br>') + '</p>';
      note.content = "<?xml version='1.0' encoding='UTF-8'?>\n<!DOCTYPE en-note SYSTEM 'http://xml.evernote.com/pub/enml2.dtd'>\n<en-note>" + temp + "</en-note>";
      noteStore.updateNote(note).then(function (note) {
         res.redirect('/evernote?guid=' + note.notebookGuid + "&message=Note appended!");
      }).catch(function (error) {
         console.log(error);
      });
   });
});

app.get('/evernote/oauth', function (req, res) {
   var client = new Evernote.Client({
      consumerKey: 'stokic16',
      consumerSecret: '106bb4375e8f0a69',
      sandbox: true,
      china: false,
   });

   client.getAccessToken(global.oauthToken,
      global.oauthTokenSecret,
      req.query.oauth_verifier,
      function (error, oauthToken, oauthTokenSecret, results) {
         if (error) {
            console.log(error);
         } else {
            res.cookie("userToken", oauthToken);
            res.redirect("/evernote");
         }
      });
});

app.get('/evernote/custom-command', function (req, res) {
   customCommand.runCustomCommand(req.query.command).then(function (result) {
      commandText = result;
      res.redirect("/evernote?message=Command executed");
   });
});

app.get('/custom-command', async function (req, res) {
   var commands = req.query.command.split(";;");
   var promises = [];

   for (var i = 0; i < commands.length; i++) {
      promises.push(customCommand.runCustomCommand(commands[i]));
   }

   commandOutput = await Promise.all(promises);

   res.render('index', {
      customCommands: customCommands,
      commandOutput: commandOutput
   });
});

app.get('/getSharepoint', function (req, res) {
   fs.readFile('./sharepoint_path.json', 'utf8', (err, data) => {
      if (!err) {
         return res.status(200).json(data);
      } else {
         console.log(err);
      }
   });
});

app.get('/setSharepoint', function (req, res) {
   var arr = [];
   arr.push({ 'host': req.query.host });
   arr.push({ 'path': req.query.path });
   fs.writeFile('./sharepoint_path.json', JSON.stringify(arr), 'utf8', function (err) {
      if (err) {
         return console.log(err);
      }
      console.log("The file was saved!");
   });

   res.render('index', { customCommands: customCommands });
});

// Start the server.
app.listen(DEFAULT_PORT);
console.log(`Listening on port ${DEFAULT_PORT}...`);