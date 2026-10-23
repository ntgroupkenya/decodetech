import { useSiteSettings } from '../siteSettings'

// An optional one-line notice across the top of every page (e.g. "Closed on Monday for the public holiday").
// The owner switches it on and writes the text in Admin → Settings.
export default function AnnouncementBar() {
  const { announcement } = useSiteSettings()
  if (!announcement?.enabled || !announcement.text) return null
  const content = announcement.link
    ? <a href={announcement.link} className="underline underline-offset-2 hover:no-underline">{announcement.text}</a>
    : announcement.text
  return (
    <div role="region" aria-label="Announcement" className="bg-brand-yellow px-4 py-1.5 text-center text-sm font-semibold text-brand-black">
      {content}
    </div>
  )
}
