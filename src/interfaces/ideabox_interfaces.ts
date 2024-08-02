import type BasePBCollection from './pocketbase_interfaces.js'

interface IIdeaBoxContainer extends BasePBCollection {
    color: string
    icon: string
    image_count: number
    link_count: number
    name: string
    text_count: number
}

interface IIdeaBoxFolder extends BasePBCollection {
    color: string
    icon: string
    name: string
    containers: string
}

interface IIdeaBoxEntry extends BasePBCollection {
    container: string
    folder: string
    content?: string
    image?: string
    title?: string
    type: 'text' | 'image' | 'link'
    pinned: boolean
    archived: boolean
}

export type { IIdeaBoxContainer, IIdeaBoxFolder, IIdeaBoxEntry }
