import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: '中文' },
] as const

const resources = {
  'en-US': {
    translation: {
      appName: 'saas-web-starter',
      navNotes: 'Notes',
      navAbout: 'About',
      notesTitle: 'Notes',
      notePlaceholder: 'Write a note',
      addNote: 'Add',
      notesEmpty: 'No notes yet.',
      noteCreated: 'Note added',
      aboutTitle: 'About',
      aboutBody: 'A clean-architecture starter: Hono on Cloudflare Workers + React SPA + D1.',
      notFoundTitle: 'Page not found',
      notFoundBody: 'That page does not exist.',
      backHome: 'Back home',
    },
  },
  'zh-CN': {
    translation: {
      appName: 'saas-web-starter',
      navNotes: '笔记',
      navAbout: '关于',
      notesTitle: '笔记',
      notePlaceholder: '写点什么',
      addNote: '添加',
      notesEmpty: '还没有笔记。',
      noteCreated: '已添加',
      aboutTitle: '关于',
      aboutBody: '一个整洁架构脚手架：Cloudflare Workers 上的 Hono + React SPA + D1。',
      notFoundTitle: '页面不存在',
      notFoundBody: '这个页面不存在。',
      backHome: '返回首页',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
})

export default i18n
