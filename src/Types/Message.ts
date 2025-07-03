import { AxiosRequestConfig } from 'axios'
import type { Readable } from 'stream'
import type { URL } from 'url'
import { proto } from '../../WAProto'
import { MEDIA_HKDF_KEY_MAPPING } from '../Defaults'
import { BinaryNode } from '../WABinary'
import type { GroupMetadata } from './GroupMetadata'
import { CacheStore } from './Socket'

// export the WAMessage Prototypes
export { proto as WAProto }
export type WAMessage = proto.IWebMessageInfo
export type WAMessageContent = proto.IMessage
export type WAContactMessage = proto.Message.IContactMessage
export type WAContactsArrayMessage = proto.Message.IContactsArrayMessage
export type WAMessageKey = proto.IMessageKey & {
	senderLid?: string
	server_id?: string
	senderPn?: string
	participantLid?: string
	participantPn?: string
}
export type WATextMessage = proto.Message.IExtendedTextMessage
export type WAContextInfo = proto.IContextInfo
export type WALocationMessage = proto.Message.ILocationMessage
export type WAGenericMediaMessage =
	| proto.Message.IVideoMessage
	| proto.Message.IImageMessage
	| proto.Message.IAudioMessage
	| proto.Message.IDocumentMessage
	| proto.Message.IStickerMessage
export const WAMessageStubType = proto.WebMessageInfo.StubType
export const WAMessageStatus = proto.WebMessageInfo.Status
import { ILogger } from '../Utils/logger'
export type WAMediaPayloadURL = { url: URL | string }
export type WAMediaPayloadStream = { stream: Readable }
export type WAMediaUpload = Buffer | WAMediaPayloadStream | WAMediaPayloadURL
export type MessageType = keyof proto.Message

export type DownloadableMessage = { mediaKey?: Uint8Array | null; directPath?: string | null; url?: string | null }

export type MessageReceiptType =
	| 'read'
	| 'read-self'
	| 'hist_sync'
	| 'peer_msg'
	| 'sender'
	| 'inactive'
	| 'played'
	| undefined

export type MediaConnInfo = {
	auth: string
	ttl: number
	hosts: { hostname: string; maxContentLengthBytes: number }[]
	fetchDate: Date
}

export interface WAUrlInfo {
	'canonical-url': string
	'matched-text': string
	title: string
	description?: string
	jpegThumbnail?: Buffer
	highQualityThumbnail?: proto.Message.IImageMessage
	originalThumbnailUrl?: string
}

type Mentionable = { mentions?: string[] }
type Contextable = { contextInfo?: proto.IContextInfo }
type ViewOnce = { viewOnce?: boolean }
type Editable = { edit?: WAMessageKey }
type WithDimensions = { width?: number; height?: number }

export type PollMessageOptions = {
	name: string
	selectableCount?: number
	values: string[]
	messageSecret?: Uint8Array
	toAnnouncementGroup?: boolean
}

type SharePhoneNumber = { sharePhoneNumber: boolean }
type RequestPhoneNumber = { requestPhoneNumber: boolean }

export type MediaType = keyof typeof MEDIA_HKDF_KEY_MAPPING
export type AnyMediaMessageContent = (
	| ({
			image: WAMediaUpload
			caption?: string
			jpegThumbnail?: string
	  } & Mentionable & Contextable & WithDimensions)
	| ({
			video: WAMediaUpload
			caption?: string
			gifPlayback?: boolean
			jpegThumbnail?: string
			ptv?: boolean
	  } & Mentionable & Contextable & WithDimensions)
	| {
			audio: WAMediaUpload
			ptt?: boolean
			seconds?: number
	  }
	| ({
			sticker: WAMediaUpload
			isAnimated?: boolean
	  } & WithDimensions)
	| ({
			document: WAMediaUpload
			mimetype: string
			fileName?: string
			caption?: string
	  } & Contextable)
) & { mimetype?: string } & Editable

export type ButtonReplyInfo = {
	displayText: string
	id: string
	index: number
}

export type GroupInviteInfo = {
	inviteCode: string
	inviteExpiration: number
	text: string
	jid: string
	subject: string
}

export type WASendableProduct = Omit<proto.Message.ProductMessage.IProductSnapshot, 'productImage'> & {
	productImage: WAMediaUpload
}


export type Button = {
	buttonId: string
	buttonText: { displayText: string }
	type: number
}

export type TemplateButton =
	| { index?: number; urlButton: { displayText: string; url: string } }
	| { index?: number; callButton: { displayText: string; phoneNumber: string } }
	| { index?: number; quickReplyButton: { displayText: string; id: string } }

export type ListRow = {
	title: string
	rowId: string
	description?: string
}

export type ListSection = {
	title: string
	rows: ListRow[]
}

export type ListMessage = {
	title?: string
	text: string
	footer?: string
	buttonText: string
	sections: ListSection[]
} & Mentionable & Contextable

export type ButtonMessage = {
	text: string
	footer?: string
	headerType: number
	buttons: Button[]
} & Mentionable & Contextable

export type TemplateMessage = {
	text: string
	footer?: string
	templateButtons: TemplateButton[]
} & Mentionable & Contextable


export type AnyRegularMessageContent = (
	| ({
			text: string
			linkPreview?: WAUrlInfo | null
	  } & Mentionable & Contextable & Editable)
	| AnyMediaMessageContent
	| ({
			poll: PollMessageOptions
	  } & Mentionable & Contextable & Editable)
	| {
			contacts: {
				displayName?: string
				contacts: proto.Message.IContactMessage[]
			}
	  }
	| {
			location: WALocationMessage
	  }
	| { react: proto.Message.IReactionMessage }
	| {
			buttonReply: ButtonReplyInfo
			type: 'template' | 'plain'
	  }
	| {
			groupInvite: GroupInviteInfo
	  }
	| {
			listReply: Omit<proto.Message.IListResponseMessage, 'contextInfo'>
	  }
	| {
			pin: WAMessageKey
			type: proto.PinInChat.Type
			time?: 86400 | 604800 | 2592000
	  }
	| {
			product: WASendableProduct
			businessOwnerJid?: string
			body?: string
			footer?: string
	  }
	| SharePhoneNumber
	| RequestPhoneNumber
	| ButtonMessage
	| TemplateMessage
	| ListMessage
) & ViewOnce

export type AnyMessageContent =
	| AnyRegularMessageContent
	| {
			forward: WAMessage
			force?: boolean
	  }
	| {
			delete: WAMessageKey
	  }
	| {
			disappearingMessagesInChat: boolean | number
	  }

export type GroupMetadataParticipants = Pick<GroupMetadata, 'participants'>

type MinimalRelayOptions = {
	messageId?: string
	useCachedGroupMetadata?: boolean
}

export type MessageRelayOptions = MinimalRelayOptions & {
	participant?: { jid: string; count: number }
	additionalAttributes?: { [_: string]: string }
	additionalNodes?: BinaryNode[]
	useUserDevicesCache?: boolean
	statusJidList?: string[]
}

export type MiscMessageGenerationOptions = MinimalRelayOptions & {
	timestamp?: Date
	quoted?: WAMessage
	ephemeralExpiration?: number | string
	mediaUploadTimeoutMs?: number
	statusJidList?: string[]
	backgroundColor?: string
	font?: number
	broadcast?: boolean
}
export type MessageGenerationOptionsFromContent = MiscMessageGenerationOptions & {
	userJid: string
}

export type WAMediaUploadFunction = (
	encFilePath: string,
	opts: { fileEncSha256B64: string; mediaType: MediaType; timeoutMs?: number }
) => Promise<{ mediaUrl: string; directPath: string }>

export type MediaGenerationOptions = {
	logger?: ILogger
	mediaTypeOverride?: MediaType
	upload: WAMediaUploadFunction
	mediaCache?: CacheStore
	mediaUploadTimeoutMs?: number
	options?: AxiosRequestConfig
	backgroundColor?: string
	font?: number
}

export type MessageContentGenerationOptions = MediaGenerationOptions & {
	getUrlInfo?: (text: string) => Promise<WAUrlInfo | undefined>
	getProfilePicUrl?: (jid: string, type: 'image' | 'preview') => Promise<string | undefined>
	jid?: string
}

export type MessageGenerationOptions = MessageContentGenerationOptions & MessageGenerationOptionsFromContent

export type MessageUpsertType = 'append' | 'notify'

export type MessageUserReceipt = proto.IUserReceipt

export type WAMessageUpdate = { update: Partial<WAMessage>; key: proto.IMessageKey }

export type WAMessageCursor = { before: WAMessageKey | undefined } | { after: WAMessageKey | undefined }

export type MessageUserReceiptUpdate = { key: proto.IMessageKey; receipt: MessageUserReceipt }

export type MediaDecryptionKeyInfo = {
	iv: Buffer
	cipherKey: Buffer
	macKey?: Buffer
}

export type MinimalMessage = Pick<proto.IWebMessageInfo, 'key' | 'messageTimestamp'>
