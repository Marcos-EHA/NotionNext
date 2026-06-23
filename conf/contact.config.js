/**
 * 社交按钮相关的配置同意放这
 */
module.exports = {
  // Redes sociales y contacto - dejar vacío para ocultar el ícono
  CONTACT_EMAIL:
    (process.env.NEXT_PUBLIC_CONTACT_EMAIL &&
      btoa(
        unescape(encodeURIComponent(process.env.NEXT_PUBLIC_CONTACT_EMAIL))
      )) ||
    btoa(unescape(encodeURIComponent('marcosherrada47@gmail.com'))), // Email de contacto
  CONTACT_GITHUB: process.env.NEXT_PUBLIC_CONTACT_GITHUB || 'https://github.com/Marcos-EHA', // GitHub
  CONTACT_LINKEDIN: process.env.NEXT_PUBLIC_CONTACT_LINKEDIN || 'https://www.linkedin.com/in/marcosherrada', // LinkedIn
  CONTACT_TWITTER: process.env.NEXT_PUBLIC_CONTACT_TWITTER || 'https://x.com/MarcosAlegreEH', // X (Twitter)
  CONTACT_WEIBO: process.env.NEXT_PUBLIC_CONTACT_WEIBO || '', // No usado
  CONTACT_TELEGRAM: process.env.NEXT_PUBLIC_CONTACT_TELEGRAM || '', // Pendiente
  CONTACT_INSTAGRAM: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || '', // Pendiente
  CONTACT_BILIBILI: process.env.NEXT_PUBLIC_CONTACT_BILIBILI || '', // No aplica
  CONTACT_YOUTUBE: process.env.NEXT_PUBLIC_CONTACT_YOUTUBE || '', // Pendiente
  CONTACT_XIAOHONGSHU: process.env.NEXT_PUBLIC_CONTACT_XIAOHONGSHU || '', // No aplica
  CONTACT_ZHISHIXINGQIU: process.env.NEXT_PUBLIC_CONTACT_ZHISHIXINGQIU || '', // No aplica
  CONTACT_WEHCHAT_PUBLIC: process.env.NEXT_PUBLIC_CONTACT_WEHCHAT_PUBLIC || '' // No aplica
}
