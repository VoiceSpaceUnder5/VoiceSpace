import React from 'react';
import ReactDOM from 'react-dom';

export interface YoutubeEmbedProps {
  left: number;
  top: number;
  videoID: string;
  width?: number;
  height?: number;
}

class YoutubeEmbedRenderer {
  private static lastComponentContainer: HTMLDivElement | null = null;

  static render(props: YoutubeEmbedProps): HTMLDivElement {
    const componentContainer = document.createElement('div');
    document.body.appendChild(componentContainer);
    ReactDOM.render(
      <YoutubeEmbed {...props}></YoutubeEmbed>,
      componentContainer,
    );
    this.lastComponentContainer = componentContainer;
    return componentContainer;
  }

  static delete(componentContainer: HTMLDivElement): void {
    ReactDOM.unmountComponentAtNode(componentContainer);
    document.body.removeChild(componentContainer);
    if (componentContainer === this.lastComponentContainer) {
      this.lastComponentContainer = null;
    }
  }

  static deleteLastRenderedComponent(): void {
    if (this.lastComponentContainer) {
      this.delete(this.lastComponentContainer);
      this.lastComponentContainer = null;
    }
  }
}

function YoutubeEmbed(props: YoutubeEmbedProps) {
  return (
    <iframe
      role="presentation"
      style={{...props, position: 'absolute', zIndex: 50}}
      frameBorder={0}
      allowFullScreen
      src={`https://www.youtube.com/embed/${props.videoID}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    ></iframe>
  );
}

export default YoutubeEmbedRenderer;
