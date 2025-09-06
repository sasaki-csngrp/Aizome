'use client';

interface ContentWithLinksProps {
  content: string;
}

export default function ContentWithLinks({ content }: ContentWithLinksProps) {
  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <span 
            key={index} 
            className="text-blue-500 hover:underline cursor-pointer" 
            onClick={() => window.open(part, '_blank', 'noopener,noreferrer')}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return <>{renderContentWithLinks(content)}</>;
}
