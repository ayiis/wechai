
  public on (event: 'dong'       , listener: string | ((this: Wechaty, data?: string) => void))                                                    : this
  public on (event: 'error'      , listener: string | ((this: Wechaty, error: Error) => void))                                                     : this
  public on (event: 'friendship' , listener: string | ((this: Wechaty, friendship: Friendship) => void))                                           : this
  public on (event: 'heartbeat'  , listener: string | ((this: Wechaty, data: any) => void))                                                        : this
  public on (event: 'login' | 'logout', listener: string | ((this: Wechaty, user: ContactSelf) => void))                                           : this
  public on (event: 'message'    , listener: string | ((this: Wechaty, message: Message) => void))                                                 : this
  public on (event: 'ready'      , listener: string | ((this: Wechaty) => void))                                                                   : this
  public on (event: 'room-invite', listener: string | ((this: Wechaty, roomInvitation: RoomInvitation) => void))                                   : this
  public on (event: 'room-join'  , listener: string | ((this: Wechaty, room: Room, inviteeList: Contact[],  inviter: Contact) => void))            : this
  public on (event: 'room-leave' , listener: string | ((this: Wechaty, room: Room, leaverList: Contact[], remover?: Contact) => void))             : this
  public on (event: 'room-topic' , listener: string | ((this: Wechaty, room: Room, newTopic: string, oldTopic: string, changer: Contact) => void)) : this
  public on (event: 'scan'       , listener: string | ((this: Wechaty, qrcode: string, status: number, data?: string) => void))                    : this
  public on (event: 'start' | 'stop', listener: string | ((this: Wechaty) => void))                                                                : this


{
    "from": msg.from()!.id,
    "to": msg.to()!.id,
    "text": msg.text(),
    "room": "",
    "type": msg.type(),
    "self": msg.self(),
    "age": msg.age(),
    "date": msg.date(),
}



/*
    一个商户的账号，对应一个ai，拥有对话列表权限，群管理权限
        - 发起好友申请
        - 接受好友申请
        - 新好友事件
        - 主动发起对话
        + 被动回答对话
        - 删除好友 ？
        -- 发给所有好友

        - 创建群
        - 接受群邀请
        - 群消息主动发起
        + 群消息被动回答
        - 拉人 / 踢人
        - 新入成员问候
        - 离开成员问候 ？
        -- 发给所有群

    管理员帐号，管理所有的ai，拥有商户管理权限，拥有ai映射权限
        -- ai由商户自己申请，平台整合
        -- ai从创建到管理都由平台负责（有风险）
*/


ayiis: wxid_m8p5ed91ksny22
jensen: zhengrenfengbrave
001: wxid_x35g6an1iygs22
qiqi:wxid_s2v0kljr0u9022
桔小秘:wxid_3xl8j2suau8b22


文字 ok
小程序 ok
图片 ok
语音 ok
红包 ok
文件 ok

推送 ok


@不能友好支持
room-leave x    踢人 ok

/*


比较常用的功能：
    1、接收好友、群发来的信息，并且能知道信息来源，是哪个人，或者哪个群的哪个人。
    2、回复信息给特定用户或者特定群，特定群支持@ 功能。
    3、能够邀请好友加入特定群。
    4、监听新增群成员的消息。


接收信息<哪个群, 哪个人>
回复信息<哪个群, 哪个人, @功能>
邀请好友
新增群成员事件


*/