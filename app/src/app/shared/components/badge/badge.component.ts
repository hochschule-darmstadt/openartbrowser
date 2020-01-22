import { Component, ViewEncapsulation, Input, OnInit, OnChanges } from "@angular/core";
import { Entity, Artwork } from "../../models/models";

@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./badge.component.scss"]
})
export class BadgeComponent implements OnInit, OnChanges {
  @Input() entity: Entity;
  @Input() isHoverBadge: boolean;
  @Input() hoveredArtwork: Artwork;

  icon: string;
  label: string;
  redirectUrl: string;
  tooltip: string;
  highlight: boolean;

  tooltipBreakLimit: number = 150;

  /* TODO:REVIEW
  Add descriptions
  */

  ngOnInit() {
    if (this.entity) {
      this.icon = icons[this.entity.type] || "fa-user";
      this.redirectUrl = `/${this.entity.type}/${this.entity.id}` || "/";
      this.label = this.entity.label || "";

      // display the abstract or description; break after defined char limit
      this.tooltip = this.entity.abstract
        ? this.entity.abstract
        : this.entity.description
          ? this.entity.description
          : null;
      if (this.tooltip) {
        this.tooltip.trim();
      }
    }

    if (this.tooltip && this.tooltip.length >= this.tooltipBreakLimit) {
      /* TODO:REVIEW
      Explain what happens here.
      */
      /* TODO:REVIEW
      It might be a good idea to remove everything in the tooltip that is between brackets ().

      Example for the painter Delacroix:
      Ferdinand Victor Eugène Delacroix (/ˈdɛləkrwɑː, ˌdɛləˈkrwɑː/ DEL-ə-krwah, DEL-ə-KRWAH,[1] French: [øʒɛn dəlakʁwa]; 26 April 1798 – 13 August 1863) was a French Romantic artist regarded from the outset of his career as the leader of the French Romantic school.

      should be:
      Ferdinand Victor Eugène Delacroix was a French Romantic artist regarded from the outset of his career as the leader of the French Romantic school.
      */

      let substr_to = this.tooltip.indexOf(".", this.tooltipBreakLimit);
      if (substr_to < this.tooltipBreakLimit) substr_to = this.tooltip.indexOf(" ", this.tooltipBreakLimit);
      if (substr_to < this.tooltipBreakLimit) substr_to = this.tooltipBreakLimit;
      this.tooltip =
        this.tooltip.substr(
          0,
          substr_to
        ) + " [...]";
    }
  }

  ngOnChanges() {
    if (this.isHoverBadge) {
      if (this.hoveredArtwork) {
        this.highlight = this.hoveredArtwork[this.entity.type + 's'].includes(this.entity.id);
      } else {
        this.highlight = false;
      }
    }
  }

}

enum icons {
  artist = "fa-user",
  artwork = "fa-image",
  movement = "fa-wind",
  location = "fa-archway",
  motif = "fa-image",
  genre = "fa-tag",
  material = "fa-scroll"
}
