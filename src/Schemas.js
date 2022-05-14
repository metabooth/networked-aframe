/* global NAF */

class Schemas {

  constructor() {
    this.schemaIds = []
    this.schemaDict = {};
    this.templateCache = {};
  }

  createDefaultSchema(name) {
    return {
      template: name,
      components: [
        'position',
        'rotation',
      ]
    }
  }

  add(schema) {
    if (this.validateSchema(schema)) {
      this.schemaDict[schema.template] = schema;
      this.schemaIds.push(schema.template)
      if(schema.addEntity) {
        this.templateCache[schema.template] = schema.addEntity;
      } else {
        var templateEl = document.querySelector(schema.template);
        if (!templateEl) {
          NAF.log.error(`Template el not found for ${schema.template}, make sure NAF.schemas.add is called after <a-scene> is defined.`);
          return;
        }
        if (!this.validateTemplate(schema, templateEl)) {
          return;
        }
        const t = document.importNode(templateEl.content, true);
        this.templateCache[schema.template] = function() {
          return t.firstElementChild.cloneNode(true);
        }
      }
    } else {
      NAF.log.error('Schema not valid: ', schema);
      NAF.log.error('See https://github.com/haydenjameslee/networked-aframe#syncing-custom-components');
    }
  }

  getCachedTemplate(template, args) {
    console.log("getCachedTemplate", template)
    return this.templateCache[template](args)
  }

  templateIsCached(template) {
    return this.templateCache.hasOwnProperty(template);
  }

  getComponents(template) {
    var components = ['position', 'rotation'];
    if (this.hasTemplate(template)) {
      components = this.schemaDict[template].components;
    }
    return components;
  }

  hasTemplate(template) {
    return this.schemaDict.hasOwnProperty(template);
  }

  templateExistsInScene(templateSelector) {
    var el = document.querySelector(templateSelector);
    return el && this.isTemplateTag(el);
  }

  validateSchema(schema) {
    return schema.hasOwnProperty('template')
      && schema.hasOwnProperty('components')
      ;
  }

  validateTemplate(schema, el) {
    if (!this.isTemplateTag(el)) {
      NAF.log.error(`Template for ${schema.template} is not a <template> tag. Instead found: ${el.tagName}`);
      return false;
    } else if (!this.templateHasOneOrZeroChildren(el)) {
      NAF.log.error(`Template for ${schema.template} has more than one child. Templates must have one direct child element, no more. Template found:`, el);
      return false;
    } else {
      return true;
    }
  }

  isTemplateTag(el) {
    return el.tagName.toLowerCase() === 'template';
  }

  templateHasOneOrZeroChildren(el) {
    return el.content.childElementCount < 2;
  }

  remove(template) {
    delete this.schemaDict[template];
  }

  clear() {
    this.schemaDict = {};
  }
}

module.exports = Schemas;
