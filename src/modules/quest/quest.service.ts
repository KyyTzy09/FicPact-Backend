import type { QuestRepository } from "./quest.repository.js";

export class QuestService {
    constructor(private readonly questRepository: QuestRepository) { }
}