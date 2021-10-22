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
  private static containers = new Set<HTMLDivElement>();

  static render(props: YoutubeEmbedProps): HTMLDivElement {
    const componentContainer = document.createElement('div');
    document.body.appendChild(componentContainer);
    ReactDOM.render(
      <YoutubeEmbed {...props}></YoutubeEmbed>,
      componentContainer,
    );
    this.lastComponentContainer = componentContainer;
    this.containers.add(componentContainer);
    return componentContainer;
  }

  private static deleteContainer(componentContainer: HTMLDivElement) {
    ReactDOM.unmountComponentAtNode(componentContainer);
    document.body.removeChild(componentContainer);
  }

  static delete(componentContainer: HTMLDivElement): void {
    this.deleteContainer(componentContainer);
    this.containers.delete(componentContainer);
    if (componentContainer === this.lastComponentContainer) {
      this.lastComponentContainer = null;
    }
  }

  static clear(): void {
    this.containers.forEach(con => {
      this.deleteContainer(con);
    });
    this.containers.clear();
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
