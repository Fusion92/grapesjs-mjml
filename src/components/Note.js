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
        "style-default": {},
        style: {},
        attributes: {},
        highlightable: true,
      },
    },

    view: {
      ...coreMjmlView,
      tagName: "div",
      attributes: {
        style: "pointer-events: all; color: blue; display: none;",
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
        const cm = editor.Commands;
        cm.add("border-open", (editor) => {
          const raw = this;
          editor.on("run:core:component-outline", () => {
            console.log("border open now", raw);
            this.el.style.display = 'block';
          });
          editor.on("stop:core:component-outline", () => {
            console.log("border closed now");
            this.el.style.display = 'none'
          });
        });

        cm.run("border-open");
      },
    },
  });
};
