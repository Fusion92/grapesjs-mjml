// Specs: https://mjml.io/documentation/#mjml-text

export default (editor, { dc, coreMjmlModel, coreMjmlView }) => {
  const type = "note";

  dc.addType(type, {
    extend: "text",
    extendFnView: ["onActive"],

    isComponent(el) {
      if (el.tagName === type.toUpperCase()) {
        return {
          type,
        };
      }
    },

    model: {
      ...coreMjmlModel,

      defaults: {
        name: type,
        draggable: "[data-gjs-type=mj-body], [data-gjs-type=mj-head]",
        stylable: false,
        highlightable: true,
        traits: [
          {
            type: 'select', // Type of the trait
            label: 'Type', // The label you will see in Settings
            name: 'kind', // The name of the attribute/property to use on component
            // default: 'start',
            options: [
              { id: 'start', name: 'Start',},
              { id: 'end', name: 'End'},
              { id: 'simple', name: 'Simple'},
            ]
          }
        ],
        attributes: {
          kind: 'start'
        }
      },
    toHTML() {
      const bar = "<!-- ******************************************** -->",
            arrowsUp = "<!-- ᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱᐱ -->",
            arrowsDown = "<!-- VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV -->",
            cmtStart = "<!-- ",
            cmtEnd = " -->",
            halfBar = " ** ",
            nl = '\n';

      let kind = this.get('attributes').kind,
          content = "",
          code = "";

            this.get('components').each((model) => {
              content += model.toHTML();
            });

             if( kind == 'start' ){
              code = bar + nl + cmtStart + halfBar + content + halfBar + cmtEnd + nl + arrowsDown;
             } else if ( kind == 'end' ){
              code = arrowsUp + nl + cmtStart + halfBar + content + halfBar + cmtEnd + nl  + bar;
             } else {
               code = cmtStart + content + cmtEnd;
             }
             return code;

    },
    },

    view: {
      ...coreMjmlView,
      tagName: "div",
      attributes: {
        style: "pointer-events: all; background-color: #ffbcf1; color: #fff; font-family: sans-serif; text-align: center; font-size: 11px; padding: 5px 10px; margin: 2px 0; ",
        "data-type": "note",
      },

      getMjmlTemplate() {
        let parentView = this.model.parent().view;
        let parentTag = this.model.parent().attributes.tagName;

        if (parentView.getInnerMjmlTemplate && parentTag === "mj-body") {
          let mjmlBody = coreMjmlView.getInnerMjmlTemplate.call(parentView);
          return {
            start: `<mjml>${mjmlBody.start}`,
            end: `${mjmlBody.end}</mjml>`,
          };
        } else if (parentView.getInnerMjmlTemplate && parentTag === "mj-head") {
          let mjmlHead = coreMjmlView.getInnerMjmlTemplate.call(parentView);
          return {
            start: `<mjml>${mjmlHead.start}`,
            end: `${mjmlHead.end}</mjml>`,
          };
        } else {
          return {
            start: `<mjml><mj-body>`,
            end: `</mj-body></mjml>`,
          };
        }
      },

      getTemplateFromEl(sandboxEl) {
        console.log("sandbox", sandboxEl);
        return sandboxEl.innerHTML;
      },

      getChildrenSelector() {
        return "*";
      },
      onActive() {
        this.getChildrenContainer().style.pointerEvents = "all";
      },

      init() {
        this.stopListening(this.model, 'change:style');
        this.listenTo(this.model, 'change:attributes change:src', this.rerender);
  
        const cm = editor.Commands;
        cm.add("border-open", (editor) => {
          editor.on("run:core:component-outline", () => {
            this.el.style.display = 'block';
          });
          editor.on("stop:core:component-outline", () => {
            this.el.style.display = 'none'
          });
        });

        cm.run("border-open");
      },
    },
  });
};
