const startOfDay = require('date-fns/startOfDay');
const endOfDay = require('date-fns/endOfDay');
const subDays = require('date-fns/subDays');
const addDays = require('date-fns/addDays');
const startOfMonth = require('date-fns/startOfMonth');
const endOfMonth = require('date-fns/endOfMonth');
const subMonths = require('date-fns/subMonths');
const add = require('date-fns/add');

const pagination = require('../helpers/pagination');
const { success, error } = require('../helpers/response');

const modelChecklist = require('../models/checklist');
const modelItem = require('../models/item');
const modelTemplate = require('../models/template');

exports.getAll = async (req, res) => {
  const {
    include,
    filter,
    sort,
    fields,
    page_limit,
    page_number
  } = req.query

  let populateItems = null;
  if (include === 'items') {
    populateItems = 'items';
  }

  try {
    const count = await modelChecklist.countDocuments();
    const offset = parseInt(page_limit) * (parseInt(page_number) - 1);

    const rows = await modelChecklist.find()
      .skip(offset)
      .limit(parseInt(page_limit))
      .populate(populateItems)
      .sort();

    const paginationResponse = await pagination(page_limit, page_number, count, '/checklists?', rows);

    return res.json(paginationResponse);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getById = async (req, res) => {
  const { checklistId } = req.params;

  try {
    const checklist = await modelChecklist.findById(checklistId);

    if ( ! checklist) {
      return res.status(404).json(error(404));
    }

    return res.json(success(checklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.create = async (req, res) => {
  const {
    object_domain,
    object_id,
    due,
    urgency,
    description,
    task_id,
    items
  } = req.body.data.attributes;

  // validation
  if (object_domain === undefined || object_id === undefined || description === undefined) {
    return res.status(422).json(error(422));
  }

  try {
    const itemIds = [];
    let checklist = await modelChecklist.create({
      object_domain,
      object_id,
      due,
      urgency,
      description
    });

    if (items.length > 0) {
      for (const description of items) {
        const payload = {
          task_id,
          due,
          urgency,
          description,
          checklist_id: checklist._id
        }

        const item = await modelItem.create(payload);

        itemIds.push(item._id);
      }
    }

    checklist = await modelChecklist.findOneAndUpdate({ _id: checklist._id }, {
      items: itemIds
    });

    return res.status(201).json(success(checklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.update = async (req, res) => {
  const { checklistId } = req.params;

  const {
    object_domain,
    object_id,
    description,
    is_completed,
    completed_at
  } = req.body.data.attributes;

  // validation
  if (object_domain === undefined || object_id === undefined || description === undefined) {
    return res.status(422).json(error(422));
  }

  try {
    const checklist = await modelChecklist.findByIdAndUpdate(checklistId, {
      object_domain,
      object_id,
      description,
      is_completed,
      completed_at
    }, {
      new: true
    });

    return res.json(success(checklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.delete = async (req, res) => {
  const { checklistId } = req.params;

  try {
    const checklist = await modelChecklist.findByIdAndDelete(checklistId);

    if (checklist.deletedCount === 0) {
      return res.status(404).json(error(404));
    }

    if (checklist.items.length > 0) {
      for (const item of checklist.items) {
        await modelItem.deleteOne({ _id: item });
      }
    }

    return res.status(204).json();
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.completeItem = async (req, res) => {
  const { data } = req.body;

  try {
    const items = [];

    if (data.length > 0) {
      const itemIds = data.map(i => i.item_id);
      const checklist = await modelChecklist.findOne({ items: itemIds });

      for (const itemId of itemIds) {
        const item = await modelItem.findByIdAndUpdate(itemId, {
          is_completed: true,
          completed_at: new Date()
        }, {
          new: true
        });

        const payload = {
          id: item._id,
          item_id: item._id,
          is_completed: item.is_completed,
          checklist_id: checklist._id
        }

        items.push(payload);
      }
    }

    return res.json(success(items));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.incompleteItem = async (req, res) => {
  const { data } = req.body;

  try {
    const items = [];

    if (data.length > 0) {
      const itemIds = data.map(i => i.item_id);
      const checklist = await modelChecklist.findOne({ items: itemIds });

      for (const itemId of itemIds) {
        const item = await modelItem.findByIdAndUpdate(itemId, {
          is_completed: false,
          completed_at: null
        }, {
          new: true
        });

        const payload = {
          id: item._id,
          item_id: item._id,
          is_completed: item.is_completed,
          checklist_id: checklist._id
        }

        items.push(payload);
      }
    }

    return res.json(success(items));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getByIdWithItems = async (req, res) => {
  const { checklistId } = req.params

  try {
    const checklist = await modelChecklist.findById(checklistId).populate('items');

    if ( ! checklist) {
      return res.status(404).json(error(404));
    }

    return res.json(success(checklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.createItem = async (req, res) => {
  const { checklistId } = req.params;

  const {
    description,
    due,
    urgency,
    assignee_id
  } = req.body.data.attributes;

  try {
    const payload = {
      description,
      due,
      urgency,
      assignee_id,
      checklist_id: checklistId
    }

    const item = await modelItem.create(payload);
    const checklist = await modelChecklist.findByIdAndUpdate(checklistId, {
      $push: {
        items: item._id
      }
    }, {
      new: true
    });

    const payloadChecklist = checklist.toJSON();
    payloadChecklist.attributes = item;

    return res.json(success(payloadChecklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getItem = async (req, res) => {
  const {
    checklistId,
    itemId
  } = req.params;

  try {
    const checklist = await modelChecklist.findById(checklistId);
    const item = await modelItem.findById(itemId);

    if ( ! checklist || ! item) {
      return res.status(404).json(error(404));
    }

    const payload = checklist.toJSON();
    payload.attributes.assignee_id = item.assignee_id;
    payload.attributes.task_id = item.task_id;
    payload.attributes.checklist_id = checklist._id;

    return res.json(success(payload));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.updateItem = async (req, res) => {
  const {
    checklistId,
    itemId
  } = req.params;

  const {
    description,
    due,
    urgency,
    assignee_id
  } = req.body.data.attributes;

  try {
    const payload = {
      description,
      due,
      urgency,
      assignee_id
    }

    const item = await modelItem.findByIdAndUpdate(itemId, payload, { new: true });
    const checklist = await modelChecklist.findById(checklistId);

    const payloadChecklist = checklist.toJSON();
    payloadChecklist.attributes = item;

    return res.json(success(payloadChecklist));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.deleteItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await modelItem.findById(itemId);

    if ( ! item) {
      return res.status(404).json(error(404));
    }

    await modelItem.findByIdAndDelete(itemId);
    await modelChecklist.findOneAndUpdate(
      { items: { $in: [item._id] } },
      { $pull: { items: item._id } }
    );

    return res.status(204).json();
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.updateItemBulk = async (req, res) => {
  const { checklistId } = req.params;

  const data = req.body.data;

  try {
    const payloads = [];

    if (data.length > 0) {
      for (const item of data) {
        const updateItem = await modelItem.findByIdAndUpdate(item.id, {
          description: item.attributes.description,
          due: item.attributes.due,
          urgency: item.attributes.urgency
        }, {
          new: true
        });

        const payload = {
          id: item.id,
          action: item.action,
          status: updateItem
            ? 200
            : 404
        }

        payloads.push(payload);
      }
    }

    return res.json(success(payloads));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.summaryItem = async (req, res) => {
  const {
    date,
    object_domain,
    tz
  } = req.query

  try {
    const startDay = startOfDay(new Date());
    const endDay = endOfDay(new Date());
    const thisWeek = addDays(new Date(), 7);
    const pastWeek = subDays(new Date(), 7);
    const startMonth = startOfMonth(new Date());
    const endMonth = endOfMonth(new Date());
    const lastMonth = subMonths(new Date(), 1);
    const startLastMonth = startOfMonth(lastMonth);
    const endLastMonth = endOfMonth(lastMonth);

    const total = await modelItem.countDocuments();
    const totalToday = await modelItem.countDocuments({
      due: {
        $gte: startDay,
        $lte: endDay
      }
    });
    const totalDue = await modelItem.countDocuments({
      due: {
        $lt: new Date()
      }
    });
    const totalThisWeek = await modelItem.countDocuments({
      due: {
        $gte: new Date(),
        $lte: thisWeek
      }
    });
    const totalPastWeek = await modelItem.countDocuments({
      due: {
        $gte: pastWeek,
        $lt: new Date()
      }
    });
    const totalThisMonth = await modelItem.countDocuments({
      due: {
        $gte: startMonth,
        $lte: endMonth
      }
    });
    const totalPastMonth = await modelItem.countDocuments({
      due: {
        $gte: startLastMonth,
        $lte: endLastMonth
      }
    });

    const payload = {
      today: totalToday,
      past_due: totalDue,
      this_week: totalThisWeek,
      past_week: totalPastWeek,
      this_month: totalThisMonth,
      past_month: totalPastMonth,
      total: total
    }

    return res.json(success(payload));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getAllItem = async (req, res) => {
  const {
    filter,
    sort,
    page_limit,
    page_number
  } = req.query

  try {
    const count = await modelItem.countDocuments();
    const offset = parseInt(page_limit) * (parseInt(page_number) - 1);

    const rows = await modelItem.find()
      .skip(offset)
      .limit(parseInt(page_limit))
      .sort();

    const paginationResponse = await pagination(page_limit, page_number, count, '/checlists/items?', rows);

    return res.json(paginationResponse);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.createTemplate = async (req, res) => {
  const {
    name,
    checklist,
    items
  } = req.body.data.attributes;

  try {
    const template = await modelTemplate.create({
      name,
      checklist,
      items
    });

    return res.status(201).json(success(template));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getAllTemplate = async (req, res) => {
  const {
    filter,
    sort,
    fields,
    page_limit,
    page_number
  } = req.query

  try {
    const count = await modelTemplate.countDocuments();
    const offset = parseInt(page_limit) * (parseInt(page_number) - 1);

    const rows = await modelTemplate.find()
      .skip(offset)
      .limit(parseInt(page_limit))
      .sort();

    const paginationResponse = await pagination(page_limit, page_number, count, '/checklists/templates?', rows);

    return res.json(paginationResponse);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.getTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await modelTemplate.findById(templateId);

    if ( ! template) {
      return res.status(404).json(error(404));
    }

    return res.json(success(template));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.updateTemplate = async (req, res) => {
  const { templateId } = req.params;

  const {
    name,
    checklist,
    items
  } = req.body.data;

  // validation
  if (name === undefined || checklist === undefined || items === undefined) {
    return res.status(422).json(error(422));
  }

  try {
    const template = await modelTemplate.findByIdAndUpdate(templateId, {
      name,
      checklist,
      items
    }, {
      new: true
    });

    return res.json(success(template));
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.deleteTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await modelTemplate.findByIdAndDelete(templateId);

    if (template.deletedCount === 0) {
      return res.status(404).json(error(404));
    }

    return res.status(204).json();
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}

exports.assignTemplate = async (req, res) => {
  const { templateId } = req.params;
  const data = req.body.data;

  try {
    const responseData = {
      meta: {
        count: '',
        total: ''
      },
      data: [],
      included: []
    };

    if (data.length > 0) {
      const template = await modelTemplate.findById(templateId);

      // looping request data
      for (const d of data) {
        // get checklist where object id and object domain
        const query = {
          object_id: d.attributes.object_id,
          object_domain: d.attributes.object_domain
        }
        const checklists = await modelChecklist
          .find(query)
          .populate('items');
        // update checklists due from due interval template
        for (const checklist of checklists) {
          let intervalChecklist = template.checklist.due_interval;
          let dueChecklist;

          if (template.checklist.due_unit === 'hour') {
            dueChecklist = { hours: intervalChecklist };
          }
          else if (template.checklist.due_unit === 'minute') {
            dueChecklist = { minutes: intervalChecklist };
          }
          else {
            dueChecklist = checklist.due;
          }

          dueChecklist = add(checklist.due, dueChecklist);

          const items = [];
          let lastDueItem = checklist.items[checklist.items.length - 1].due;
          for (const templateItem of template.items) {
            let intervalItem = templateItem.due_interval;
            let dueItem;

            if (templateItem.due_unit === 'hour') {
              dueItem = { hours: intervalItem };
            }
            else if (templateItem.due_unit === 'minute') {
              dueItem = { minutes: intervalItem };
            }
            else {
              dueItem = templateItem.due;
            }

            dueItem = add(lastDueItem, dueItem);

            const item = await modelItem.create({
              description: templateItem.description,
              urgency: templateItem.urgency,
              due: dueItem,
              checklist_id: checklist._id
            });

            lastDueItem = item.due;

            responseData.included.push(item.toJSON());
            items.push(item);
          }

          const checklistData = await modelChecklist.findOneAndUpdate(query, {
            due: dueChecklist,
            $push: {
              items: {
                $each: items
              }
            }
          }, {
            new: true,
            strict: false
          });

          const relationshipData = {
            relationships:{
              items: {
                links: {
                  self: `${process.env.BASE_URL}/checklists/${checklistData._id}/relationships/items`,
                  related: `${process.env.BASE_URL}/checklists/${checklistData._id}/items`
                },
                data: items.map(i => {
                  return {
                    type: 'items',
                    id: i._id
                  }
                })
              }
            }
          }

          const payloadChecklist = Object.assign(checklistData.toJSON(), relationshipData);
          delete payloadChecklist.attributes.items;
          delete payloadChecklist.attributes.id;
          responseData.data.push(payloadChecklist);

          intervalChecklist += intervalChecklist;
        }
      }
    }

    responseData.meta.count = responseData.data.length;
    responseData.meta.total = responseData.data.length;

    return res.json(responseData);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json(error(500));
  }
}