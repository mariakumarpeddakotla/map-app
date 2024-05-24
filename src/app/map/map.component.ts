import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  map!: L.Map;
  marker!: L.Marker;
  latitude: number = 16.291245098208776;
  longitude: number = 80.45379003722765;
  landmarkName: string = 'Default Landmark';
  isVisible: boolean = false;
  popupTitle: string = '';
  popupMessage: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.initializeMap();
    this.getLocationName(this.latitude, this.longitude);
  }

  /**
   * Initializes the Leaflet map and sets up event listeners for map clicks and marker drag events.
   */
  initializeMap(): void {
    this.map = L.map('map', { attributionControl: false }).setView([this.latitude, this.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.marker = L.marker([this.latitude, this.longitude], { draggable: true }).addTo(this.map);
    // Add event listener for map clicks
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;
      this.marker.setLatLng(e.latlng);
      this.getLocationName(this.latitude, this.longitude);
      this.marker.setPopupContent(this.landmarkName);
    });
    // Add event listener for marker drag events
    this.marker.on('dragend', (e: L.DragEndEvent) => {
      this.latitude = e.target.getLatLng().lat;
      this.longitude = e.target.getLatLng().lng;
      this.getLocationName(this.latitude, this.longitude);
      this.marker.setPopupContent(this.landmarkName);
    });
  }

  /**
   * Fetches the location name based on the provided latitude and longitude using the Nominatim reverse geocoding API.
   * @param latitude - The latitude of the location.
   * @param longitude - The longitude of the location.
   */
  getLocationName(latitude: number, longitude: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    this.http.get(url).subscribe((response: any) => {
      this.landmarkName = response.display_name;
    }, (error) => {
      console.error('Error fetching location name:', error);
      this.landmarkName = `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;
    });
  }

  /**
   * Logs the location name, latitude, and longitude to the console and sets the isVisible to display popup on save button clicked.
   */
  saveLocation(): void {
    this.popupTitle = 'Location Saved';
    this.popupMessage = 'Your location has been successfully saved.';
    this.isVisible = true;
    console.log('Location Name:', this.landmarkName);
    console.log('Latitude:', this.latitude);
    console.log('Longitude:', this.longitude);
  }
/**
 * When cancel button is clicked the popup is displayed by setting isVisible to true. 
 */
  cancel(): void {
    this.popupTitle = 'Action Cancelled';
    this.popupMessage = 'The action has been cancelled.';
    this.isVisible = true;
  }

/**
 * To close the popup
 */
  close() {
    this.isVisible = !this.isVisible;
  }
}
