import { mjmlConvert } from './components/utils.js';
const juice = require('juice');

export default (editor, opt = {}) => {
  const config = editor.getConfig();
  const codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
  const container = document.createElement('div');
  const cmdm = editor.Commands;
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';

  // Init code viewer
  codeViewer.set({
    codeName: 'htmlmixed',
    theme: opt.codeViewerTheme,
  });

  const getMjml = ( html = editor.getHtml() ) => {
    const mjml = opt.preMjml + html + opt.postMjml;
    return mjmlConvert(mjml, opt.fonts);
  };

  // Set the command which could be used outside
  cmdm.add('mjml-get-code', {
    run() {
      return getMjml();
    }
  });

  let mjmlCode;
  let htmlCode;

  return {

    buildEditor(label) {
      const ecm = editor.CodeManager;
      const cm = ecm.getViewer('CodeMirror').clone();
      const txtarea = document.createElement('textarea');
      const el = document.createElement('div');
      el.style.flex = '1 0 auto';
      el.style.padding = '5px';
      el.style.maxWidth = '50%';
      el.style.boxSizing = 'border-box';

      const codeEditor = cm.set({
        label: label,
        codeName: 'htmlmixed',
        theme: opt.codeViewerTheme,
        input: txtarea,
      });

      const elEditor = new ecm.EditorView({ model: codeEditor, config }).render().el;
      el.appendChild(elEditor);
      codeEditor.init(txtarea);
      return { codeEditor, el };
    },

    run(editor, sender = {}) {
      const modal = editor.Modal;
      modal.setTitle(editor.I18n.t('grapesjs-mjml.panels.export.title'));
      modal.setContent('');
      modal.setContent(container);

      const edhtml = editor.getHtml().replace(/(\<note\>)/g, '<!-- ').replace(/(\<\/note\>)/g, ' -->');
      let edcss = editor.getCss({avoidProtected: true});
      edcss = edcss.replace(/(body.?\{.+?\})/g, '')
      .replace(/(p.?\{.+?\})/g, '')
      .replace(/(img.?\{.+?\})/g, '')
      .replace(/(table[\s\S]+?\{.+?\})/g, '');
      let upHtml = edhtml.replace(/(\<\/mj-style\>)/, `$1 <mj-style inline="inline" >${edcss}</mj-style>`);

      if (!mjmlCode) {
        const codeViewer = this.buildEditor('MJML');
        mjmlCode = codeViewer.codeEditor;
        container.appendChild(codeViewer.el);
      }
      if (!htmlCode) {
        const codeViewer = this.buildEditor('HTML');
        htmlCode = codeViewer.codeEditor;
        container.appendChild(codeViewer.el);
      }

      modal.open();

      if (mjmlCode) {

        mjmlCode.setContent(opt.preMjml + upHtml + opt.postMjml);
        //mjmlCode.editor.setOption('lineWrapping', 1);
        mjmlCode.editor.refresh();
      }

      if (htmlCode) {
        const mjml = getMjml(upHtml);
        if (mjml.errors.length) {
          mjml.errors.forEach((err) => {
            console.warn(err.formattedMessage);
          });
        }
        htmlCode.setContent(mjml.html);
        //htmlCode.editor.setOption('lineWrapping', 1);
        htmlCode.editor.refresh();
      }

      sender.set && sender.set('active', 0);
    },

  };
};
