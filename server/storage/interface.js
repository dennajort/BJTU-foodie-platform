function IStorage() {}

IStorage.prototype.toUri(container, path) {
  throw new Error("Not implemented")
}

IStorage.prototype.exists(container, path) {
  throw new Error("Not implemented")
}

IStorage.prototype.remove(container, path) {
  throw new Error("Not implemented")
}

IStorage.prototype.createReadStream(container, path) {
  throw new Error("Not implemented")
}

IStorage.prototype.createWriteStream(container, path) {
  throw new Error("Not implemented")
}

module.exports = IStorage
