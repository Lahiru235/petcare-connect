const Pet = require("../models/Pet");
const User = require("../models/User");

const canTouchPet = (user, pet) =>
  user.role === "admin" ||
  user.role === "receptionist" ||
  String(pet.owner._id || pet.owner) === String(user._id);

// @desc  Add a pet (FR-03)  @route POST /api/pets  @access owner, receptionist, admin
const createPet = async (req, res, next) => {
  try {
    // receptionist/admin may create a pet for another owner by passing ownerId
    const ownerId =
      ["receptionist", "admin"].includes(req.user.role) && req.body.ownerId
        ? req.body.ownerId
        : req.user._id;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") return res.status(400).json({ message: "Pet owner not found" });

    const pet = await Pet.create({ ...req.body, owner: ownerId });
    res.status(201).json({ pet, message: `${pet.name} added` });
  } catch (err) {
    next(err);
  }
};

// @desc  List pets  @route GET /api/pets  @access Private
const getPets = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "owner") filter.owner = req.user._id;
    else if (req.query.ownerId) filter.owner = req.query.ownerId;

    if (req.query.includeInactive !== "true") filter.isActive = true;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const pets = await Pet.find(filter).populate("owner", "name email phone").sort("-createdAt");
    res.json({ count: pets.length, pets });
  } catch (err) {
    next(err);
  }
};

// @desc  Single pet  @route GET /api/pets/:id  @access Private
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("owner", "name email phone address");
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // doctors need to read patient records, owners only their own
    if (req.user.role === "owner" && !canTouchPet(req.user, pet)) {
      return res.status(403).json({ message: "This pet is not on your profile" });
    }
    res.json({ pet });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a pet  @route PUT /api/pets/:id  @access owner(own), receptionist, admin
const updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (!canTouchPet(req.user, pet)) return res.status(403).json({ message: "This pet is not on your profile" });

    const fields = ["name", "species", "breed", "gender", "age", "weight", "colour", "notes"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) pet[f] = req.body[f];
    });
    await pet.save();
    res.json({ pet, message: "Pet details updated" });
  } catch (err) {
    next(err);
  }
};

// @desc  Deactivate a pet profile  @route DELETE /api/pets/:id  @access owner(own), admin
const deactivatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (!canTouchPet(req.user, pet)) return res.status(403).json({ message: "This pet is not on your profile" });

    pet.isActive = !pet.isActive;
    await pet.save();
    res.json({ pet, message: pet.isActive ? "Pet profile reactivated" : "Pet profile deactivated" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPet, getPets, getPetById, updatePet, deactivatePet };
